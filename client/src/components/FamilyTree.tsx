// src/components/FamilyTree.tsx - Version améliorée avec animations et interactivité
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { getImageUrl } from '../services/apiService';
import './FamilyTree.css';

interface PersonFront {
  _id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  dateDeces?: string;
  lieuNaissance?: string;
  lieuDeces?: string;
  photo?: string;
  genre?: 'homme' | 'femme' | 'autre';
  pereExterne?: string;
  mereExterne?: string;
}

interface RelationFront {
  _id: string;
  type: string;
  personne1: {
    _id: string;
    nom: string;
    prenom: string;
  };
  personne2: {
    _id: string;
    nom: string;
    prenom: string;
  };
  dateDebut?: string;
  details?: string;
}

interface FamilyTreeProps {
  people: PersonFront[];
  relations: RelationFront[];
  rootId: string;
  onSelectRoot?: (id: string) => void;
}

interface TreeNode {
  person: PersonFront;
  spouses: PersonFront[];
  children: TreeNode[];
  level: number;
}

interface AncestorNode {
  person: PersonFront;
  spouses: PersonFront[];
  biologicalCoParentIds: string[]; // IDs des conjoints qui sont aussi parents biologiques
  parents: AncestorNode[];
  generation: number;
}

// Utilitaires pour le calcul d'âge
const calculateAge = (birthDate: string, deathDate?: string): number => {
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatYear = (dateStr: string): number => {
  return new Date(dateStr).getFullYear();
};

const FamilyTree: React.FC<FamilyTreeProps> = ({ people, relations, rootId, onSelectRoot }) => {
  // États
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([rootId]));
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  
  // États pour Pan & Drag
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fonctions pour récupérer les relations
  const getParents = useCallback((personId: string): PersonFront[] => {
    const parentsFromEnfant = relations
      .filter(r => r.type === 'enfant' && r.personne1._id === personId)
      .map(r => people.find(p => p._id === r.personne2._id))
      .filter(p => p !== undefined) as PersonFront[];
    
    const parentsFromParent = relations
      .filter(r => r.type === 'parent' && r.personne2._id === personId)
      .map(r => people.find(p => p._id === r.personne1._id))
      .filter(p => p !== undefined) as PersonFront[];
    
    const allParents = [...parentsFromEnfant, ...parentsFromParent];
    const uniqueParents = allParents.filter((parent, index, self) => 
      index === self.findIndex(p => p._id === parent._id)
    );
    
    return uniqueParents;
  }, [relations, people]);

  const getChildren = useCallback((personId: string): PersonFront[] => {
    const asParent = relations
      .filter(r => r.type === 'parent' && r.personne1._id === personId)
      .map(r => people.find(p => p._id === r.personne2._id))
      .filter(p => p !== undefined) as PersonFront[];
    
    const asParentInverse = relations
      .filter(r => r.type === 'enfant' && r.personne2._id === personId)
      .map(r => people.find(p => p._id === r.personne1._id))
      .filter(p => p !== undefined) as PersonFront[];
    
    const allChildren = [...asParent, ...asParentInverse];
    const uniqueChildren = allChildren.filter((child, index, self) => 
      index === self.findIndex(c => c._id === child._id)
    );
    
    return uniqueChildren;
  }, [relations, people]);

  const getSpouses = useCallback((personId: string): PersonFront[] => {
    const spouseRelations = relations.filter(r => 
      r.type === 'conjoint' && 
      (r.personne1._id === personId || r.personne2._id === personId)
    );
    
    return spouseRelations
      .map(r => {
        const spouseId = r.personne1._id === personId 
          ? r.personne2._id 
          : r.personne1._id;
        return people.find(p => p._id === spouseId);
      })
      .filter(p => p !== undefined) as PersonFront[];
  }, [relations, people]);

  const getSiblings = useCallback((personId: string): PersonFront[] => {
    const siblingRelations = relations.filter(r => 
      r.type === 'frere_soeur' && 
      (r.personne1._id === personId || r.personne2._id === personId)
    );
    
    return siblingRelations
      .map(r => {
        const siblingId = r.personne1._id === personId 
          ? r.personne2._id 
          : r.personne1._id;
        return people.find(p => p._id === siblingId);
      })
      .filter(p => p !== undefined) as PersonFront[];
  }, [relations, people]);

  // Recherche de personnes
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return people.filter(p => 
      p.nom.toLowerCase().includes(query) || 
      p.prenom.toLowerCase().includes(query)
    );
  }, [searchQuery, people]);

  // Pan & Drag handlers - Optionnel, moins sensible
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // Seulement si on maintient Shift ou si on clique sur le fond
    if (e.shiftKey || (e.target as HTMLElement).classList.contains('tree-viewport')) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  }, [isPanning, startPan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Zoom avec Ctrl+molette
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.3), 2.5));
    } else {
      // Scroll normal pour déplacer la vue (sensibilité réduite)
      e.preventDefault();
      const sensitivity = 0.5; // Réduire la vitesse du scroll
      setPanOffset(prev => ({
        x: prev.x - e.deltaX * sensitivity,
        y: prev.y - e.deltaY * sensitivity
      }));
    }
  }, []);

  // Boutons de navigation directionnels
  const moveStep = 100; // Pixels par clic
  const moveUp = () => setPanOffset(prev => ({ ...prev, y: prev.y + moveStep }));
  const moveDown = () => setPanOffset(prev => ({ ...prev, y: prev.y - moveStep }));
  const moveLeft = () => setPanOffset(prev => ({ ...prev, x: prev.x + moveStep }));
  const moveRight = () => setPanOffset(prev => ({ ...prev, x: prev.x - moveStep }));

  // Navigation au clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si on est dans un champ de saisie
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-expand les 2 premiers niveaux de descendants
  useEffect(() => {
    const autoExpandDescendants = (nodeId: string, depth: number, maxDepth: number = 2): Set<string> => {
      if (depth >= maxDepth) return new Set();
      
      const expanded = new Set<string>([nodeId]);
      const children = getChildren(nodeId);
      
      children.forEach(child => {
        const childExpanded = autoExpandDescendants(child._id, depth + 1, maxDepth);
        childExpanded.forEach(id => expanded.add(id));
      });
      
      return expanded;
    };
    
    setExpandedNodes(autoExpandDescendants(rootId, 0, 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootId, relations]);

  // Centrer sur une personne
  const centerOnPerson = useCallback((personId: string) => {
    setHighlightedId(personId);
    onSelectRoot?.(personId);
    // Centrer la vue
    if (contentRef.current) {
      const contentWidth = contentRef.current.scrollWidth;
      const offsetX = -(contentWidth / 2);
      setPanOffset({ x: offsetX, y: 0 });
    } else {
      setPanOffset({ x: 0, y: 0 });
    }
    setZoomLevel(1);
    setTimeout(() => setHighlightedId(null), 3000);
  }, [onSelectRoot]);

  // Fonctions de zoom
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.3));
  
  // Centrer la vue (réinitialiser position et zoom)
  const handleCenter = useCallback(() => {
    if (contentRef.current && containerRef.current) {
      const contentWidth = contentRef.current.scrollWidth;
      const offsetX = -(contentWidth / 2);
      setPanOffset({ x: offsetX, y: 0 });
    } else {
      setPanOffset({ x: 0, y: 0 });
    }
    setZoomLevel(1);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Centrer automatiquement l'arbre au chargement
  useEffect(() => {
    const centerTree = () => {
      if (contentRef.current) {
        const contentWidth = contentRef.current.scrollWidth;
        // Calculer l'offset pour centrer le contenu
        const offsetX = -(contentWidth / 2);
        setPanOffset({ x: offsetX, y: 0 });
      }
    };
    // Attendre que le rendu soit terminé
    const timer = setTimeout(centerTree, 100);
    return () => clearTimeout(timer);
  }, [rootId, people.length]);

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  if (people.length === 0) {
    return (
      <div className="family-tree-container">
        <div className="empty-tree-message">
          <div className="empty-tree-icon">🌳</div>
          <div className="empty-tree-title">Aucune personne à afficher</div>
          <div className="empty-tree-subtitle">Ajoutez des membres à votre famille pour voir l'arbre</div>
        </div>
      </div>
    );
  }

  const rootPerson = people.find(p => p._id === rootId);
  if (!rootPerson) {
    return (
      <div className="family-tree-container">
        <div className="empty-tree-message">
          <div className="empty-tree-icon">🔍</div>
          <div className="empty-tree-title">Personne introuvable</div>
          <div className="empty-tree-subtitle">La personne sélectionnée n'existe plus</div>
        </div>
      </div>
    );
  }

  // Construire l'arbre des ancêtres
  const buildAncestorTree = (personId: string, generation: number, visited: Set<string> = new Set(), childId?: string): AncestorNode | null => {
    if (visited.has(personId)) return null;
    visited.add(personId);

    const person = people.find(p => p._id === personId);
    if (!person) return null;

    const spouses = getSpouses(personId);
    const parents = getParents(personId);
    
    // Identifier quels conjoints sont aussi des parents biologiques de l'enfant (childId)
    const childParents = childId ? getParents(childId) : [];
    const biologicalCoParentIds = spouses
      .filter(spouse => childParents.some(p => p._id === spouse._id))
      .map(spouse => spouse._id);

    const parentNodes = parents
      .map(parent => buildAncestorTree(parent._id, generation - 1, new Set(visited), personId))
      .filter(node => node !== null) as AncestorNode[];

    return { person, spouses, biologicalCoParentIds, parents: parentNodes, generation };
  };

  // Construire l'arbre des descendants
  const buildTree = (personId: string, level: number, ancestorPath: Set<string> = new Set()): TreeNode | null => {
    if (ancestorPath.has(personId)) return null;
    
    const person = people.find(p => p._id === personId);
    if (!person) return null;

    const newAncestorPath = new Set(ancestorPath);
    newAncestorPath.add(personId);

    const spouses = getSpouses(personId);
    const children = getChildren(personId);

    const childNodes = children
      .map(child => buildTree(child._id, level + 1, newAncestorPath))
      .filter(node => node !== null) as TreeNode[];

    return { person, spouses, children: childNodes, level };
  };

  const tree = buildTree(rootId, 0);
  const ancestorTree = buildAncestorTree(rootId, 0);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Composant PersonCard amélioré avec tooltip et infos détaillées
  const PersonCard = ({ 
    person, 
    isRoot, 
    isSpouse = false,
    hasChildren = false,
    isExpanded = false,
    onToggle
  }: { 
    person: PersonFront; 
    isRoot: boolean; 
    isSpouse?: boolean;
    hasChildren?: boolean;
    isExpanded?: boolean;
    onToggle?: () => void;
  }) => {
    const fullName = `${person.prenom} ${person.nom}`;
    const isDeceased = !!person.dateDeces;
    const age = calculateAge(person.dateNaissance, person.dateDeces);
    const birthYear = formatYear(person.dateNaissance);
    const deathYear = person.dateDeces ? formatYear(person.dateDeces) : null;
    const isHighlighted = highlightedId === person._id;

    const cardClasses = [
      'person-card',
      isRoot && 'person-card--root',
      person.genre === 'homme' && 'person-card--male',
      person.genre === 'femme' && 'person-card--female',
      isSpouse && 'person-card--spouse',
      isDeceased && 'person-card--deceased',
      !isSpouse && 'person-card--clickable',
      isHighlighted && 'person-card--highlighted'
    ].filter(Boolean).join(' ');

    const avatarClasses = [
      'person-avatar',
      isRoot && 'person-avatar--root',
      person.genre === 'homme' && 'person-avatar--male',
      person.genre === 'femme' && 'person-avatar--female',
      !person.genre && 'person-avatar--other'
    ].filter(Boolean).join(' ');

    return (
      <div
        className={cardClasses}
        onClick={(e) => {
          e.stopPropagation();
          if (!isSpouse && onSelectRoot) onSelectRoot(person._id);
        }}
      >
        {/* Tooltip avec infos détaillées */}
        <div className="person-tooltip">
          <div className="tooltip-row">
            <span className="tooltip-label">Né(e) :</span>
            <span className="tooltip-value">{formatDate(person.dateNaissance)}</span>
          </div>
          {isDeceased && (
            <div className="tooltip-row">
              <span className="tooltip-label">Décédé(e) :</span>
              <span className="tooltip-value">{formatDate(person.dateDeces!)}</span>
            </div>
          )}
          {person.lieuNaissance && (
            <div className="tooltip-row">
              <span className="tooltip-label">Lieu :</span>
              <span className="tooltip-value">{person.lieuNaissance}</span>
            </div>
          )}
          {person.pereExterne && (
            <div className="tooltip-row">
              <span className="tooltip-label">Père :</span>
              <span className="tooltip-value">{person.pereExterne}</span>
            </div>
          )}
          {person.mereExterne && (
            <div className="tooltip-row">
              <span className="tooltip-label">Mère :</span>
              <span className="tooltip-value">{person.mereExterne}</span>
            </div>
          )}
        </div>

        {/* Badge étoile pour root */}
        {isRoot && <div className="person-star-badge">★</div>}

        {/* Avatar */}
        <div className={avatarClasses}>
          {person.photo ? (
            <img src={getImageUrl(person.photo)} alt={fullName} />
          ) : (
            fullName[0].toUpperCase()
          )}
          {/* Badge décédé */}
          {isDeceased && (
            <div className="person-deceased-badge">🕊️</div>
          )}
        </div>

        {/* Nom avec icône de genre */}
        <div className={`person-name ${isRoot ? 'person-name--root' : ''}`}>
          {person.genre === 'homme' && <span className="gender-icon gender-icon--male">♂</span>}
          {person.genre === 'femme' && <span className="gender-icon gender-icon--female">♀</span>}
          {fullName}
        </div>

        {/* Dates */}
        <div className="person-dates">
          {birthYear}{deathYear ? ` - ${deathYear}` : ''}
        </div>

        {/* Âge */}
        <div className="person-age">
          {isDeceased ? `Décédé(e) à ${age} ans` : `${age} ans`}
        </div>

        {/* Parents externes */}
        {(person.pereExterne || person.mereExterne) && (
          <div className="person-external-parents">
            {person.pereExterne && (
              <div className="external-parent">
                <span className="external-parent-label">Père:</span> {person.pereExterne}
              </div>
            )}
            {person.mereExterne && (
              <div className="external-parent">
                <span className="external-parent-label">Mère:</span> {person.mereExterne}
              </div>
            )}
          </div>
        )}

        {/* Bouton d'expansion */}
        {hasChildren && !isSpouse && onToggle && (
          <button
            className="expand-button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isExpanded ? '−' : '+'}
          </button>
        )}
      </div>
    );
  };

  // Composants de connexion SVG améliorés
  const ConnectorLine = ({ 
    type = 'vertical', 
    length = 40,
    color = '#818cf8',
    dashed = false,
    animated = false
  }: { 
    type?: 'vertical' | 'horizontal';
    length?: number;
    color?: string;
    dashed?: boolean;
    animated?: boolean;
  }) => {
    const gradientId = `gradient-${type}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (type === 'vertical') {
      return (
        <svg width="12" height={length} style={{ display: 'block', margin: '0 auto' }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="50%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path
            d={`M6,0 L6,${length}`}
            stroke={`url(#${gradientId})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={dashed ? "8,4" : "none"}
            fill="none"
            className={animated ? "connector-animated" : ""}
          />
          {/* Points décoratifs aux extrémités */}
          <circle cx="6" cy="2" r="3" fill={color} opacity="0.6" />
          <circle cx="6" cy={length - 2} r="3" fill={color} opacity="0.6" />
        </svg>
      );
    }
    return (
      <svg width={length} height="12" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          d={`M0,6 L${length},6`}
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={dashed ? "8,4" : "none"}
          fill="none"
          className={animated ? "connector-animated" : ""}
        />
        {/* Points décoratifs aux extrémités */}
        <circle cx="2" cy="6" r="3" fill={color} opacity="0.6" />
        <circle cx={length - 2} cy="6" r="3" fill={color} opacity="0.6" />
      </svg>
    );
  };

  // Rendu récursif de l'arbre
  const renderNode = (node: TreeNode | null): React.ReactElement | null => {
    if (!node) return null;

    const isExpanded = expandedNodes.has(node.person._id);
    const hasChildren = node.children.length > 0;
    const siblings = getSiblings(node.person._id);

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        margin: '1rem'
      }}>
        {/* Frères et sœurs (affichés horizontalement) */}
        {siblings.length > 0 && node.level === 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: 12,
            border: '2px dashed #bdbdbd'
          }}>
            {siblings.map((sibling, index) => (
              <React.Fragment key={sibling._id}>
                {index > 0 && (
                  <div style={{ color: '#9e9e9e', fontSize: 24 }}>↔️</div>
                )}
                <PersonCard 
                  person={sibling} 
                  isRoot={false}
                />
              </React.Fragment>
            ))}
            <div style={{ color: '#9e9e9e', fontSize: 24 }}>↔️</div>
            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#fff',
              borderRadius: 8,
              border: '2px solid #9e9e9e',
              fontSize: 12,
              color: '#757575',
              fontWeight: 600
            }}>
              Frères/Sœurs
            </div>
          </div>
        )}

        {/* Couple (personne + conjoint) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem',
          marginBottom: hasChildren && isExpanded ? '1.5rem' : 0
        }}>
          {/* Si plusieurs conjoints, mettre la personne au centre */}
          {node.spouses.length > 1 ? (
            <>
              {/* Conjoint(s) à gauche */}
              {node.spouses.slice(0, Math.ceil(node.spouses.length / 2)).map((spouse, index) => (
                <React.Fragment key={`left-${spouse._id}`}>
                  <PersonCard 
                    person={spouse} 
                    isRoot={false}
                    isSpouse={true}
                  />
                  <div className="spouse-connector">
                    <ConnectorLine type="horizontal" length={30} color="#ec4899" />
                    💕
                    <ConnectorLine type="horizontal" length={30} color="#ec4899" />
                  </div>
                </React.Fragment>
              ))}
              
              {/* Personne au centre */}
              <PersonCard 
                person={node.person} 
                isRoot={node.level === 0}
                hasChildren={hasChildren}
                isExpanded={isExpanded}
                onToggle={() => toggleNode(node.person._id)}
              />
              
              {/* Conjoint(s) à droite */}
              {node.spouses.slice(Math.ceil(node.spouses.length / 2)).map((spouse, index) => (
                <React.Fragment key={`right-${spouse._id}`}>
                  <div className="spouse-connector">
                    <ConnectorLine type="horizontal" length={30} color="#ec4899" />
                    💕
                    <ConnectorLine type="horizontal" length={30} color="#ec4899" />
                  </div>
                  <PersonCard 
                    person={spouse} 
                    isRoot={false}
                    isSpouse={true}
                  />
                </React.Fragment>
              ))}
            </>
          ) : (
            <>
              {/* Affichage classique pour un seul ou aucun conjoint */}
              <PersonCard 
                person={node.person} 
                isRoot={node.level === 0}
                hasChildren={hasChildren}
                isExpanded={isExpanded}
                onToggle={() => toggleNode(node.person._id)}
              />
              
              {node.spouses.map((spouse, index) => (
                <React.Fragment key={spouse._id}>
                  <div className="spouse-connector">
                    <ConnectorLine type="horizontal" length={30} color="#ec4899" />
                    💕
                    <ConnectorLine type="horizontal" length={30} color="#ec4899" />
                  </div>
                  <PersonCard 
                    person={spouse} 
                    isRoot={false}
                    isSpouse={true}
                  />
                </React.Fragment>
              ))}
            </>
          )}
        </div>

        {/* Enfants groupés par mère */}
        {hasChildren && isExpanded && (() => {
          // Grouper les enfants par mère
          const childrenByMother = new Map<string, TreeNode[]>();
          
          // Pour chaque enfant, trouver sa mère parmi les conjoints
          node.children.forEach(child => {
            let motherFound = false;
            
            // Vérifier chaque conjoint pour voir s'il est parent de cet enfant
            node.spouses.forEach(spouse => {
              const isParent = relations.some(r => 
                (r.type === 'parent' && r.personne1._id === spouse._id && r.personne2._id === child.person._id) ||
                (r.type === 'enfant' && r.personne2._id === spouse._id && r.personne1._id === child.person._id)
              );
              
              if (isParent) {
                const key = spouse._id;
                if (!childrenByMother.has(key)) {
                  childrenByMother.set(key, []);
                }
                childrenByMother.get(key)!.push(child);
                motherFound = true;
              }
            });
            
            // Si aucune mère trouvée, mettre dans un groupe "inconnu"
            if (!motherFound) {
              const key = 'unknown';
              if (!childrenByMother.has(key)) {
                childrenByMother.set(key, []);
              }
              childrenByMother.get(key)!.push(child);
            }
          });
          
          return (
            <div className="children-container">
              {/* Ligne verticale principale */}
              <ConnectorLine type="vertical" length={40} />
              
              {/* Conteneur horizontal pour les groupes de mères */}
              <div className="children-row">
                {Array.from(childrenByMother.entries()).map(([motherId, children], groupIndex) => {
                  const mother = node.spouses.find(s => s._id === motherId);
                  const groupColors = ['#6366f1', '#14b8a6', '#f59e0b'];
                  const groupColor = groupColors[groupIndex % groupColors.length];
                  
                  return (
                    <div key={motherId} className="child-branch">
                      {/* Indicateur de la mère */}
                      {mother && (
                        <div 
                          className={`mother-group-badge mother-group-badge--${(groupIndex % 3) + 1}`}
                        >
                          👶 Enfants de {mother.prenom}
                        </div>
                      )}
                      
                      {/* Ligne verticale vers les enfants */}
                      <ConnectorLine type="vertical" length={20} color={groupColor} />
                      
                      {/* Enfants de cette mère */}
                      <div className="children-row" style={{ position: 'relative', paddingTop: '1.5rem' }}>
                        {/* Ligne horizontale reliant les enfants */}
                        {children.length > 1 && (
                          <div 
                            className="horizontal-connector"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: `calc(50% / ${children.length} + 6px)`,
                              right: `calc(50% / ${children.length} + 6px)`,
                              height: 4,
                              background: groupColor,
                              borderRadius: 2,
                              boxShadow: `0 2px 8px ${groupColor}40`
                            }} 
                          />
                        )}
                        {/* Points décoratifs aux extrémités */}
                        {children.length > 1 && (
                          <>
                            <div style={{
                              position: 'absolute',
                              top: -2,
                              left: `calc(50% / ${children.length})`,
                              width: 8,
                              height: 8,
                              background: groupColor,
                              borderRadius: '50%',
                              boxShadow: `0 2px 6px ${groupColor}50`
                            }} />
                            <div style={{
                              position: 'absolute',
                              top: -2,
                              right: `calc(50% / ${children.length})`,
                              width: 8,
                              height: 8,
                              background: groupColor,
                              borderRadius: '50%',
                              boxShadow: `0 2px 6px ${groupColor}50`
                            }} />
                          </>
                        )}
                        
                        {children.map((child, childIndex) => (
                          <div key={child.person._id} className="child-branch">
                            {/* Ligne verticale pour chaque enfant */}
                            <div style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)' }}>
                              <ConnectorLine type="vertical" length={24} color={groupColor} />
                            </div>
                            
                            {/* Badge numéro d'enfant */}
                            <div className="child-number" style={{ backgroundColor: groupColor }}>
                              {childIndex + 1}
                            </div>
                            
                            {renderNode(child)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // Rendu récursif des ancêtres
  const renderAncestorNode = (node: AncestorNode | null): React.ReactElement | null => {
    if (!node) return null;

    // Séparer les conjoints: co-parents biologiques vs autres conjoints
    const biologicalCoParents = node.spouses.filter(s => node.biologicalCoParentIds.includes(s._id));
    const otherSpouses = node.spouses.filter(s => !node.biologicalCoParentIds.includes(s._id));

    return (
      <div className="generation-section">
        {/* Parents du nœud actuel */}
        {node.parents.length > 0 && (
          <>
            <div style={{ 
              display: 'flex', 
              gap: '3rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '1rem'
            }}>
              {node.parents.map(parent => renderAncestorNode(parent))}
            </div>
            <ConnectorLine type="vertical" length={40} />
          </>
        )}

        {/* Couple (personne + co-parent biologique) */}
        <div className="couple-container">
          <PersonCard 
            person={node.person} 
            isRoot={false}
          />
          
          {/* Afficher d'abord le co-parent biologique avec un badge spécial */}
          {biologicalCoParents.map((spouse) => (
            <React.Fragment key={spouse._id}>
              <div className="spouse-connector">
                <ConnectorLine type="horizontal" length={30} color="#4caf50" />
                👨‍👩‍👧
                <ConnectorLine type="horizontal" length={30} color="#4caf50" />
              </div>
              <div style={{ position: 'relative' }}>
                <div className="biological-parent-badge">Mère/Père</div>
                <PersonCard 
                  person={spouse} 
                  isRoot={false}
                  isSpouse={true}
                />
              </div>
            </React.Fragment>
          ))}
          
          {/* Afficher les autres conjoints (non parents biologiques) */}
          {otherSpouses.map((spouse) => (
            <React.Fragment key={spouse._id}>
              <div className="spouse-connector">
                <ConnectorLine type="horizontal" length={30} color="#ec4899" />
                💕
                <ConnectorLine type="horizontal" length={30} color="#ec4899" />
              </div>
              <div style={{ position: 'relative' }}>
                <div className="other-spouse-badge">Autre conjoint(e)</div>
                <PersonCard 
                  person={spouse} 
                  isRoot={false}
                  isSpouse={true}
                />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Minimap Component
  const Minimap = () => {
    if (!showMinimap || !contentRef.current) return null;
    
    const minimapScale = 0.08;
    
    return (
      <div className="tree-minimap">
        <div className="minimap-content">
          {people.slice(0, 30).map((person, index) => {
            const isPersonRoot = person._id === rootId;
            return (
              <div
                key={person._id}
                className={`minimap-person ${person.genre === 'homme' ? 'minimap-person--male' : 'minimap-person--female'} ${isPersonRoot ? 'minimap-person--root' : ''}`}
                style={{
                  width: isPersonRoot ? 8 : 5,
                  height: isPersonRoot ? 8 : 5,
                  top: `${20 + (index % 5) * 25}%`,
                  left: `${10 + Math.floor(index / 5) * 15}%`,
                }}
              />
            );
          })}
          <div
            className="minimap-viewport"
            style={{
              width: `${100 / zoomLevel}%`,
              height: `${100 / zoomLevel}%`,
              left: `${Math.max(0, Math.min(100 - (100 / zoomLevel), 50 - panOffset.x * minimapScale))}%`,
              top: `${Math.max(0, Math.min(100 - (100 / zoomLevel), 50 - panOffset.y * minimapScale))}%`,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`family-tree-container ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {/* Barre d'outils */}
      <div className="tree-toolbar">
        <div className="toolbar-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Rechercher une personne..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            padding: '8px 0',
            maxHeight: 200,
            overflowY: 'auto',
            minWidth: 200,
            zIndex: 1001
          }}>
            {searchResults.map(person => (
              <div
                key={person._id}
                onClick={() => {
                  centerOnPerson(person._id);
                  setSearchQuery('');
                }}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>{person.genre === 'homme' ? '♂' : '♀'}</span>
                <span>{person.prenom} {person.nom}</span>
              </div>
            ))}
          </div>
        )}
        <button className="toolbar-button" onClick={handleCenter} title="Centrer la vue">
          ⊙ Centrer
        </button>
        <button 
          className={`toolbar-button ${isFullscreen ? 'toolbar-button--primary' : ''}`}
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
        >
          {isFullscreen ? '⊠' : '⊞'} {isFullscreen ? 'Quitter' : 'Plein écran'}
        </button>
      </div>

      {/* Zone de l'arbre avec pan/drag */}
      <div
        className={`tree-viewport ${isPanning ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          ref={contentRef}
          className="tree-content"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            left: '50%',
            top: '50px',
          }}
        >
          {/* Section Ancêtres */}
          {ancestorTree && ancestorTree.parents.length > 0 && (
            <div className="generation-section">
              <div className="generation-label generation-label--ancestors">
                👴👵 Ancêtres
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '3rem', 
                justifyContent: 'center', 
                flexWrap: 'wrap'
              }}>
                {ancestorTree.parents.map((parent) => (
                  <div key={parent.person._id}>
                    {renderAncestorNode(parent)}
                  </div>
                ))}
              </div>
              <ConnectorLine type="vertical" length={50} />
            </div>
          )}

          {/* Section Personne sélectionnée */}
          <div className="generation-section">
            <div className="generation-label generation-label--current">
              👤 Personne sélectionnée
            </div>
            {tree && renderNode(tree)}
          </div>

          {/* Message si aucune relation */}
          {(!ancestorTree || ancestorTree.parents.length === 0) && 
           (!tree || tree.children.length === 0) && 
           (!tree?.spouses || tree.spouses.length === 0) && (
            <div className="empty-tree-message">
              <div className="empty-tree-icon">🌳</div>
              <div className="empty-tree-title">Aucune relation familiale</div>
              <div className="empty-tree-subtitle">
                Utilisez le formulaire "Ajouter une relation" pour créer des liens familiaux.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Minimap */}
      <Minimap />

      {/* Contrôles de navigation (flèches) */}
      <div className="tree-navigation">
        <div className="nav-row">
          <button className="nav-button" onClick={moveUp} title="Monter">▲</button>
        </div>
        <div className="nav-row">
          <button className="nav-button" onClick={moveLeft} title="Gauche">◀</button>
          <button className="nav-button nav-center" onClick={handleCenter} title="Centrer">⊙</button>
          <button className="nav-button" onClick={moveRight} title="Droite">▶</button>
        </div>
        <div className="nav-row">
          <button className="nav-button" onClick={moveDown} title="Descendre">▼</button>
        </div>
      </div>

      {/* Contrôles de zoom */}
      <div className="tree-controls">
        <button className="control-button" onClick={handleZoomIn} title="Zoomer">+</button>
        <div className="zoom-display">{Math.round(zoomLevel * 100)}%</div>
        <button className="control-button" onClick={handleZoomOut} title="Dézoomer">−</button>
        <button 
          className={`control-button ${showMinimap ? 'control-button--active' : ''}`} 
          onClick={() => setShowMinimap(prev => !prev)}
          title="Minimap"
        >
          ▣
        </button>
      </div>

      {/* Légende */}
      <div className="tree-legend">
        <div className="legend-item">
          <div className="legend-dot legend-dot--root" />
          <span>Sélectionné</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot--male" />
          <span>Homme</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot--female" />
          <span>Femme</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot--spouse" />
          <span>Conjoint(e)</span>
        </div>
        <div className="legend-item">
          <span style={{ fontSize: 14 }}>🕊️</span>
          <span>Décédé(e)</span>
        </div>
      </div>

      {/* Aide pour la navigation */}
      {isFullscreen && (
        <div style={{
          position: 'absolute',
          top: 80,
          right: 24,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 11,
          opacity: 0.8
        }}>
          Appuyez sur <strong>Échap</strong> pour quitter
        </div>
      )}
    </div>
  );
};

export default FamilyTree;