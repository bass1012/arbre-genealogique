import React, { useState, useMemo } from 'react';
import { Card, Select, Button, Result, Tag, Typography, Divider } from 'antd';
import { SearchOutlined, SwapOutlined, UserOutlined, HeartOutlined } from '@ant-design/icons';
import './RelationshipFinder.css';

const { Text } = Typography;

interface Person {
  _id: string;
  nom: string;
  prenom: string;
  genre?: 'homme' | 'femme' | 'autre';
}

interface Relation {
  _id: string;
  type: string;
  personne1: { _id: string; nom: string; prenom: string };
  personne2: { _id: string; nom: string; prenom: string };
}

interface RelationshipFinderProps {
  personnes: Person[];
  relations: Relation[];
}

interface PathNode {
  personId: string;
  relationshipType: string; // 'parent', 'enfant', 'conjoint'
}

const RelationshipFinder: React.FC<RelationshipFinderProps> = ({ personnes, relations }) => {
  const [person1Id, setPerson1Id] = useState<string | null>(null);
  const [person2Id, setPerson2Id] = useState<string | null>(null);
  const [result, setResult] = useState<{ path: PathNode[]; relationship: string; description: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Trier les personnes par ordre alphabétique
  const personnesTriees = useMemo(() => {
    return [...personnes].sort((a, b) => {
      const nomCompare = a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
      if (nomCompare !== 0) return nomCompare;
      return a.prenom.localeCompare(b.prenom, 'fr', { sensitivity: 'base' });
    });
  }, [personnes]);

  // Construire le graphe des relations
  const graph = useMemo(() => {
    const g: Map<string, Array<{ targetId: string; type: string }>> = new Map();
    
    personnes.forEach(p => g.set(p._id, []));
    
    relations.forEach(rel => {
      const p1Id = rel.personne1._id;
      const p2Id = rel.personne2._id;
      
      if (rel.type === 'parent') {
        // p1 est parent de p2
        g.get(p1Id)?.push({ targetId: p2Id, type: 'enfant' });
        g.get(p2Id)?.push({ targetId: p1Id, type: 'parent' });
      } else if (rel.type === 'enfant') {
        // p1 est enfant de p2
        g.get(p1Id)?.push({ targetId: p2Id, type: 'parent' });
        g.get(p2Id)?.push({ targetId: p1Id, type: 'enfant' });
      } else if (rel.type === 'conjoint' || rel.type === 'mariage') {
        g.get(p1Id)?.push({ targetId: p2Id, type: 'conjoint' });
        g.get(p2Id)?.push({ targetId: p1Id, type: 'conjoint' });
      }
    });
    
    return g;
  }, [personnes, relations]);

  // BFS pour trouver le chemin le plus court
  const findPath = (startId: string, endId: string): PathNode[] | null => {
    if (startId === endId) return [];
    
    const visited = new Set<string>();
    const queue: Array<{ id: string; path: PathNode[] }> = [{ id: startId, path: [] }];
    visited.add(startId);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = graph.get(current.id) || [];
      
      for (const neighbor of neighbors) {
        if (visited.has(neighbor.targetId)) continue;
        
        const newPath = [...current.path, { personId: neighbor.targetId, relationshipType: neighbor.type }];
        
        if (neighbor.targetId === endId) {
          return newPath;
        }
        
        visited.add(neighbor.targetId);
        queue.push({ id: neighbor.targetId, path: newPath });
      }
    }
    
    return null;
  };

  // Calculer la relation à partir du chemin
  const calculateRelationship = (path: PathNode[], person1: Person, person2: Person): { relationship: string; description: string } => {
    if (path.length === 0) {
      return { relationship: 'Même personne', description: 'Vous avez sélectionné la même personne.' };
    }

    const isMale = person2.genre === 'homme';
    const steps = path.map(p => p.relationshipType);
    
    // Relations directes
    if (steps.length === 1) {
      if (steps[0] === 'parent') {
        return { 
          relationship: isMale ? 'Père' : 'Mère', 
          description: `${person2.prenom} est ${isMale ? 'le père' : 'la mère'} de ${person1.prenom}.` 
        };
      }
      if (steps[0] === 'enfant') {
        return { 
          relationship: isMale ? 'Fils' : 'Fille', 
          description: `${person2.prenom} est ${isMale ? 'le fils' : 'la fille'} de ${person1.prenom}.` 
        };
      }
      if (steps[0] === 'conjoint') {
        return { 
          relationship: isMale ? 'Époux' : 'Épouse', 
          description: `${person2.prenom} est ${isMale ? "l'époux" : "l'épouse"} de ${person1.prenom}.` 
        };
      }
    }

    // Compter les générations (parent = +1, enfant = -1)
    let generationDiff = 0;
    let hasConjoint = false;
    
    steps.forEach((step) => {
      if (step === 'parent') generationDiff++;
      else if (step === 'enfant') generationDiff--;
      else if (step === 'conjoint') {
        hasConjoint = true;
      }
    });

    // Grands-parents, arrière-grands-parents, etc.
    if (!hasConjoint && generationDiff > 0 && steps.every(s => s === 'parent')) {
      const prefix = generationDiff === 2 ? 'Grand-' : 
                     generationDiff === 3 ? 'Arrière-grand-' :
                     generationDiff === 4 ? 'Arrière-arrière-grand-' :
                     `Ancêtre (${generationDiff} générations) `;
      return {
        relationship: prefix + (isMale ? 'père' : 'mère'),
        description: `${person2.prenom} est ${isMale ? 'le' : 'la'} ${prefix.toLowerCase()}${isMale ? 'père' : 'mère'} de ${person1.prenom}.`
      };
    }

    // Petits-enfants, arrière-petits-enfants, etc.
    if (!hasConjoint && generationDiff < 0 && steps.every(s => s === 'enfant')) {
      const depth = Math.abs(generationDiff);
      const prefix = depth === 2 ? 'Petit-' : 
                     depth === 3 ? 'Arrière-petit-' :
                     depth === 4 ? 'Arrière-arrière-petit-' :
                     `Descendant (${depth} générations) `;
      return {
        relationship: prefix + (isMale ? 'fils' : 'fille'),
        description: `${person2.prenom} est ${isMale ? 'le' : 'la'} ${prefix.toLowerCase()}${isMale ? 'fils' : 'fille'} de ${person1.prenom}.`
      };
    }

    // Frères et sœurs (parent -> enfant)
    if (steps.length === 2 && steps[0] === 'parent' && steps[1] === 'enfant') {
      return {
        relationship: isMale ? 'Frère' : 'Sœur',
        description: `${person2.prenom} est ${isMale ? 'le frère' : 'la sœur'} de ${person1.prenom}.`
      };
    }

    // Oncle/Tante (parent -> parent -> enfant)
    if (steps.length === 3 && steps[0] === 'parent' && steps[1] === 'parent' && steps[2] === 'enfant') {
      return {
        relationship: isMale ? 'Oncle' : 'Tante',
        description: `${person2.prenom} est ${isMale ? "l'oncle" : "la tante"} de ${person1.prenom}.`
      };
    }

    // Neveu/Nièce (parent -> enfant -> enfant)
    if (steps.length === 3 && steps[0] === 'parent' && steps[1] === 'enfant' && steps[2] === 'enfant') {
      return {
        relationship: isMale ? 'Neveu' : 'Nièce',
        description: `${person2.prenom} est ${isMale ? 'le neveu' : 'la nièce'} de ${person1.prenom}.`
      };
    }

    // Cousins germains (parent -> parent -> enfant -> enfant)
    if (steps.length === 4 && 
        steps[0] === 'parent' && steps[1] === 'parent' && 
        steps[2] === 'enfant' && steps[3] === 'enfant') {
      return {
        relationship: isMale ? 'Cousin germain' : 'Cousine germaine',
        description: `${person2.prenom} est ${isMale ? 'le cousin germain' : 'la cousine germaine'} de ${person1.prenom}.`
      };
    }

    // Grand-oncle/Grand-tante
    if (steps.length === 4 && 
        steps[0] === 'parent' && steps[1] === 'parent' && steps[2] === 'parent' && steps[3] === 'enfant') {
      return {
        relationship: isMale ? 'Grand-oncle' : 'Grand-tante',
        description: `${person2.prenom} est ${isMale ? 'le grand-oncle' : 'la grand-tante'} de ${person1.prenom}.`
      };
    }

    // Petit-neveu/Petite-nièce
    if (steps.length === 4 && 
        steps[0] === 'parent' && steps[1] === 'enfant' && steps[2] === 'enfant' && steps[3] === 'enfant') {
      return {
        relationship: isMale ? 'Petit-neveu' : 'Petite-nièce',
        description: `${person2.prenom} est ${isMale ? 'le petit-neveu' : 'la petite-nièce'} de ${person1.prenom}.`
      };
    }

    // Cousins plus éloignés
    const parentSteps = steps.filter(s => s === 'parent').length;
    const childSteps = steps.filter(s => s === 'enfant').length;
    
    if (!hasConjoint && parentSteps > 0 && childSteps > 0) {
      const cousinDegree = Math.min(parentSteps, childSteps) - 1;
      const removal = Math.abs(parentSteps - childSteps);
      
      if (cousinDegree > 0) {
        let degreeText = cousinDegree === 1 ? 'germain' : 
                         cousinDegree === 2 ? 'issu de germain' : 
                         `au ${cousinDegree}e degré`;
        let removalText = removal > 0 ? ` (${removal}× removed)` : '';
        return {
          relationship: `${isMale ? 'Cousin' : 'Cousine'} ${degreeText}${removalText}`,
          description: `${person2.prenom} et ${person1.prenom} sont cousins ${degreeText}${removalText}.`
        };
      }
    }

    // Beaux-parents, belle-famille via conjoint
    if (hasConjoint) {
      // Beau-père/Belle-mère (conjoint -> parent)
      if (steps.length === 2 && steps[0] === 'conjoint' && steps[1] === 'parent') {
        return {
          relationship: isMale ? 'Beau-père' : 'Belle-mère',
          description: `${person2.prenom} est ${isMale ? 'le beau-père' : 'la belle-mère'} de ${person1.prenom}.`
        };
      }
      // Beau-fils/Belle-fille (enfant -> conjoint) ou (conjoint -> enfant)
      if (steps.length === 2 && 
          ((steps[0] === 'enfant' && steps[1] === 'conjoint') || (steps[0] === 'conjoint' && steps[1] === 'enfant'))) {
        return {
          relationship: isMale ? 'Beau-fils' : 'Belle-fille',
          description: `${person2.prenom} est ${isMale ? 'le beau-fils' : 'la belle-fille'} de ${person1.prenom}.`
        };
      }
      // Beau-frère/Belle-sœur
      if (steps.length === 2 && steps[0] === 'conjoint' && steps[1] === 'parent') {
        // déjà géré en haut
      }
      if ((steps.length === 3 && steps[0] === 'conjoint' && steps[1] === 'parent' && steps[2] === 'enfant') ||
          (steps.length === 3 && steps[0] === 'parent' && steps[1] === 'enfant' && steps[2] === 'conjoint')) {
        return {
          relationship: isMale ? 'Beau-frère' : 'Belle-sœur',
          description: `${person2.prenom} est ${isMale ? 'le beau-frère' : 'la belle-sœur'} de ${person1.prenom}.`
        };
      }
    }

    // Relation générique
    return {
      relationship: 'Parent éloigné',
      description: `${person2.prenom} et ${person1.prenom} sont liés par ${steps.length} étapes de parenté.`
    };
  };

  const handleSearch = () => {
    if (!person1Id || !person2Id) return;
    
    setSearching(true);
    setResult(null);
    setNotFound(false);
    
    setTimeout(() => {
      const path = findPath(person1Id, person2Id);
      
      if (path === null) {
        setNotFound(true);
      } else {
        const p1 = personnes.find(p => p._id === person1Id)!;
        const p2 = personnes.find(p => p._id === person2Id)!;
        const { relationship, description } = calculateRelationship(path, p1, p2);
        setResult({ path, relationship, description });
      }
      
      setSearching(false);
    }, 500);
  };

  const swapPersons = () => {
    const temp = person1Id;
    setPerson1Id(person2Id);
    setPerson2Id(temp);
    setResult(null);
    setNotFound(false);
  };

  const getPersonName = (id: string) => {
    const person = personnes.find(p => p._id === id);
    return person ? `${person.prenom} ${person.nom}` : '';
  };

  const filterOption = (input: string, option: any) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  return (
    <Card 
      className="relationship-finder-card"
      title={
        <div className="finder-title">
          <SearchOutlined /> Rechercher une relation de parenté
        </div>
      }
    >
      <div className="finder-selectors">
        <div className="selector-group">
          <Text strong>Personne 1</Text>
          <Select
            showSearch
            placeholder="Sélectionner une personne"
            optionFilterProp="children"
            filterOption={filterOption}
            value={person1Id}
            onChange={(value) => {
              setPerson1Id(value);
              setResult(null);
              setNotFound(false);
            }}
            style={{ width: '100%' }}
            options={personnesTriees.map(p => ({
              value: p._id,
              label: `${p.prenom} ${p.nom}`,
            }))}
          />
        </div>

        <Button 
          icon={<SwapOutlined />} 
          onClick={swapPersons}
          className="swap-button"
          type="text"
        />

        <div className="selector-group">
          <Text strong>Personne 2</Text>
          <Select
            showSearch
            placeholder="Sélectionner une personne"
            optionFilterProp="children"
            filterOption={filterOption}
            value={person2Id}
            onChange={(value) => {
              setPerson2Id(value);
              setResult(null);
              setNotFound(false);
            }}
            style={{ width: '100%' }}
            options={personnesTriees.map(p => ({
              value: p._id,
              label: `${p.prenom} ${p.nom}`,
            }))}
          />
        </div>
      </div>

      <Button 
        type="primary" 
        icon={<SearchOutlined />}
        onClick={handleSearch}
        loading={searching}
        disabled={!person1Id || !person2Id}
        block
        size="large"
        className="search-button"
      >
        Trouver la relation
      </Button>

      {result && (
        <div className="result-container">
          <Divider />
          <Result
            status="success"
            icon={<HeartOutlined style={{ color: '#ec4899' }} />}
            title={
              <div className="result-title">
                <Tag color="magenta" className="relationship-tag">{result.relationship}</Tag>
              </div>
            }
            subTitle={result.description}
          />
          
          {result.path.length > 0 && (
            <div className="path-visualization">
              <Text type="secondary">Chemin de parenté :</Text>
              <div className="path-steps">
                <Tag color="blue" icon={<UserOutlined />}>{getPersonName(person1Id!)}</Tag>
                {result.path.map((node, index) => (
                  <React.Fragment key={index}>
                    <span className="path-arrow">
                      → <span className="relation-type">
                        {node.relationshipType === 'parent' ? '👨‍👩‍👧 parent' : 
                         node.relationshipType === 'enfant' ? '👶 enfant' : '💕 conjoint'}
                      </span> →
                    </span>
                    <Tag color="blue" icon={<UserOutlined />}>{getPersonName(node.personId)}</Tag>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {notFound && (
        <div className="result-container">
          <Divider />
          <Result
            status="warning"
            title="Aucune relation trouvée"
            subTitle="Ces deux personnes ne semblent pas être liées dans l'arbre généalogique."
          />
        </div>
      )}
    </Card>
  );
};

export default RelationshipFinder;
