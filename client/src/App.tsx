// src/App.tsx
import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Card,
  List,
  Form,
  Input,
  DatePicker,
  Space,
  Tag,
  Popconfirm,
  message,
  Segmented,
  Modal,
  Upload,
  Avatar,
  Select,
  Checkbox,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  UnorderedListOutlined,
  ApartmentOutlined,
  EditOutlined,
  CameraOutlined,
  ManOutlined,
  WomanOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserAddOutlined,
  CopyOutlined,
  LinkOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "antd/dist/reset.css";
import "./App.css";
import RelationForm from "./components/RelationForm";
import FamilyTree from "./components/FamilyTree";
import RelationshipFinder from "./components/RelationshipFinder";
import AdminDashboard from "./components/Admin/AdminDashboard";
import ProfilePage from "./components/ProfilePage";
import { useAuth } from "./context/AuthContext";
import apiService, { getImageUrl } from "./services/apiService";

const { Header, Content } = Layout;

interface User {
  _id: string | number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

interface Famille {
  _id: string | number;
  nom: string;
  description?: string;
}

interface Personne {
  _id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  dateDeces?: string;
  lieuDeces?: string;
  photo?: string;
  genre?: "homme" | "femme";
  pereExterne?: string;
  mereExterne?: string;
}

interface Relation {
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
  dateFin?: string;
  details?: string;
}

interface AppProps {
  user: User;
  famille: Famille;
}

function App({ user, famille }: AppProps) {
  const { logout } = useAuth();
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [showRelationForm, setShowRelationForm] = useState(false);
  const [view, setView] = useState<"list" | "tree" | "fullTree" | "admin" | "profile" | "search">(
    "list",
  );
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Personne | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [personInfoModalVisible, setPersonInfoModalVisible] = useState(false);
  const [selectedPersonInfo, setSelectedPersonInfo] = useState<Personne | null>(
    null,
  );
  const [searchPersonne, setSearchPersonne] = useState<string>("");
  const [isDecede, setIsDecede] = useState<boolean>(false);
  const [isDecedeEdit, setIsDecedeEdit] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // États pour la gestion des invitations
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string>("");
  const [inviteForm] = Form.useForm();

  // Charger les personnes
  const chargerPersonnes = async () => {
    try {
      const response = await apiService.get("/api/personnes");
      setPersonnes(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Erreur lors du chargement des personnes:", error);
      message.error("Erreur lors du chargement des personnes");
      setPersonnes([]);
    }
  };

  // Charger les relations
  const chargerRelations = async () => {
    try {
      const response = await apiService.get("/api/relations");
      setRelations(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Erreur lors du chargement des relations:", error);
      message.error("Erreur lors du chargement des relations");
      setRelations([]);
    }
  };

  // Charger les invitations et membres
  const chargerInvitationsEtMembres = async () => {
    try {
      const [invitationsRes, membersRes] = await Promise.all([
        apiService.get("/api/invitations"),
        apiService.get("/api/invitations/members")
      ]);
      setInvitations(Array.isArray(invitationsRes.data) ? invitationsRes.data : []);
      setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
    } catch (error) {
      console.error("Erreur chargement invitations:", error);
    }
  };

  // Créer une invitation
  const creerInvitation = async (values: any) => {
    setInviteLoading(true);
    try {
      const response = await apiService.post("/api/invitations", {
        email: values.email || undefined,
        role: values.role || 'membre'
      });
      if (response.success) {
        setGeneratedInviteUrl(response.data.invitation.url);
        message.success("Invitation créée !");
        chargerInvitationsEtMembres();
        inviteForm.resetFields();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Erreur lors de la création de l'invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  // Copier le lien d'invitation
  const copierLienInvitation = () => {
    navigator.clipboard.writeText(generatedInviteUrl);
    message.success("Lien copié !");
  };

  // Révoquer une invitation
  const revoquerInvitation = async (id: string) => {
    try {
      await apiService.delete(`/api/invitations/${id}`);
      message.success("Invitation révoquée");
      chargerInvitationsEtMembres();
    } catch (error) {
      message.error("Erreur lors de la révocation");
    }
  };

  // Charger les données au démarrage
  useEffect(() => {
    chargerPersonnes();
    chargerRelations();
  }, []);

  // Mettre à jour le titre de l'onglet avec le nom de la famille
  useEffect(() => {
    if (famille?.nom) {
      document.title = `Arbre Généalogique - Famille ${famille.nom}`;
    } else {
      document.title = "Arbre Généalogique";
    }
  }, [famille]);

  // Convertir image en base64
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Gestionnaire d'ajout de personne
  const ajouterPersonne = async (values: any) => {
    try {
      await apiService.post("/api/personnes", {
        nom: values.nom,
        prenom: values.prenom,
        dateNaissance: values.dateNaissance
          ? values.dateNaissance.format("YYYY-MM-DD")
          : undefined,
        genre: values.genre,
        photo: photoBase64 || undefined,
        dateDeces: values.dateDeces
          ? values.dateDeces.format("YYYY-MM-DD")
          : undefined,
        lieuDeces: values.lieuDeces || undefined,
        pereExterne: values.pereExterne || undefined,
        mereExterne: values.mereExterne || undefined,
      });

      await chargerPersonnes();
      form.resetFields();
      setPhotoBase64("");
      setIsDecede(false);
      message.success("Personne ajoutée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la personne:", error);
      message.error("Erreur lors de l'ajout de la personne");
    }
  };

  // Gestionnaire d'ajout de relation
  const handleRelationAdded = async () => {
    await chargerRelations();
    message.success("Relation ajoutée avec succès");
  };

  // Ouvrir le modal d'édition
  const ouvrirModalEdition = (personne: Personne) => {
    setEditingPerson(personne);
    setPhotoBase64(personne.photo || "");
    const hasDateDeces = !!personne.dateDeces;
    setIsDecedeEdit(hasDateDeces);
    editForm.setFieldsValue({
      nom: personne.nom,
      prenom: personne.prenom,
      dateNaissance: dayjs(personne.dateNaissance),
      genre: personne.genre,
      isDecede: hasDateDeces,
      dateDeces: personne.dateDeces ? dayjs(personne.dateDeces) : undefined,
      lieuDeces: personne.lieuDeces || undefined,
      pereExterne: personne.pereExterne || undefined,
      mereExterne: personne.mereExterne || undefined,
    });
    setIsEditModalVisible(true);
  };

  // Modifier une personne
  const modifierPersonne = async (values: any) => {
    if (!editingPerson) return;

    try {
      // Si photoBase64 est vide mais qu'il y avait une photo avant, envoyer null pour la supprimer
      let photoValue: string | null = photoBase64 || null;
      
      await apiService.put(`/api/personnes/${editingPerson._id}`, {
        nom: values.nom,
        prenom: values.prenom,
        dateNaissance: values.dateNaissance
          ? values.dateNaissance.format("YYYY-MM-DD")
          : undefined,
        genre: values.genre,
        photo: photoValue,
        dateDeces: values.dateDeces
          ? values.dateDeces.format("YYYY-MM-DD")
          : null,
        lieuDeces: values.lieuDeces || null,
        pereExterne: values.pereExterne || null,
        mereExterne: values.mereExterne || null,
      });

      await chargerPersonnes();
      setIsEditModalVisible(false);
      setEditingPerson(null);
      setPhotoBase64("");
      setIsDecedeEdit(false);
      editForm.resetFields();
      message.success("Personne modifiée avec succès");
    } catch (error) {
      console.error("Erreur lors de la modification de la personne:", error);
      message.error("Erreur lors de la modification de la personne");
    }
  };

  // Ouvrir le modal d'informations de personne
  const ouvrirInfoPersonne = (personneId: string) => {
    const personne = personnes.find((p) => p._id === personneId);
    if (personne) {
      setSelectedPersonInfo(personne);
      setPersonInfoModalVisible(true);
    }
  };

  // Récupérer les parents d'une personne
  const getParentsInfo = (personneId: string) => {
    // Cas 1: relation type "enfant" où personne1 est l'enfant et personne2 est le parent
    const parentsFromEnfant = relations
      .filter((r) => r.type === "enfant" && r.personne1._id === personneId)
      .map((r) => personnes.find((p) => p._id === r.personne2._id))
      .filter((p) => p !== undefined) as Personne[];
    
    // Cas 2: relation type "parent" où personne1 est le parent et personne2 est l'enfant
    const parentsFromParent = relations
      .filter((r) => r.type === "parent" && r.personne2._id === personneId)
      .map((r) => personnes.find((p) => p._id === r.personne1._id))
      .filter((p) => p !== undefined) as Personne[];
    
    // Combiner et dédupliquer
    const allParents = [...parentsFromEnfant, ...parentsFromParent];
    return allParents.filter((parent, index, self) => 
      index === self.findIndex(p => p._id === parent._id)
    );
  };

  // Récupérer les enfants d'une personne
  const getEnfantsInfo = (personneId: string) => {
    return relations
      .filter(
        (r) =>
          (r.type === "parent" && r.personne1._id === personneId) ||
          (r.type === "enfant" && r.personne2._id === personneId),
      )
      .map((r) =>
        r.type === "parent"
          ? personnes.find((p) => p._id === r.personne2._id)
          : personnes.find((p) => p._id === r.personne1._id),
      )
      .filter((p) => p !== undefined) as Personne[];
  };

  // Récupérer les conjoints d'une personne
  const getConjointsInfo = (personneId: string) => {
    return relations
      .filter(
        (r) =>
          r.type === "conjoint" &&
          (r.personne1._id === personneId || r.personne2._id === personneId),
      )
      .map((r) =>
        r.personne1._id === personneId
          ? personnes.find((p) => p._id === r.personne2._id)
          : personnes.find((p) => p._id === r.personne1._id),
      )
      .filter((p) => p !== undefined) as Personne[];
  };

  // Fonction pour afficher le type de relation de manière lisible
  const getRelationLabel = (type: string) => {
    const labels: Record<string, string> = {
      parent: "Parent",
      enfant: "Enfant",
      conjoint: "Conjoint",
      frere_soeur: "Frère/Sœur",
    };
    return labels[type] || type;
  };

  // Gestionnaire de suppression de relation
  const supprimerRelation = async (relationId: string) => {
    try {
      await apiService.delete(`/api/relations/${relationId}`);
      await chargerRelations();
      message.success("Relation supprimée avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de la relation:", error);
      message.error("Erreur lors de la suppression de la relation");
    }
  };

  // Gestionnaire de suppression de personne
  const supprimerPersonne = async (personneId: string) => {
    try {
      await apiService.delete(`/api/personnes/${personneId}`);
      await chargerPersonnes();
      await chargerRelations();
      if (selectedPersonId === personneId) {
        setSelectedPersonId(null);
      }
      message.success("Personne supprimée avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la personne:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Erreur lors de la suppression de la personne";
      message.error(errorMessage);
    }
  };

  // Filtrer les personnes en fonction de la recherche et trier par ordre alphabétique
  const personnesFiltrees = personnes
    .filter((personne) => {
      if (!searchPersonne) return true;
      const searchLower = searchPersonne.toLowerCase();
      return (
        personne.nom.toLowerCase().includes(searchLower) ||
        personne.prenom.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Trier par nom puis par prénom
      const nomCompare = a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
      if (nomCompare !== 0) return nomCompare;
      return a.prenom.localeCompare(b.prenom, 'fr', { sensitivity: 'base' });
    });

  // Filtrer les relations pour ne montrer que celles des personnes filtrées
  const relationsFiltrees = relations.filter((relation) => {
    if (!searchPersonne) return true;

    // Vérifier si personne1 ou personne2 est dans la liste des personnes filtrées
    const personne1Match = personnesFiltrees.some(
      (p) => p._id === relation.personne1._id,
    );
    const personne2Match = personnesFiltrees.some(
      (p) => p._id === relation.personne2._id,
    );

    return personne1Match || personne2Match;
  });

  return (
    <Layout className="app-shell">
      <Header className="app-shell-header">
        <div className="app-shell-brand">
          <ApartmentOutlined className="app-shell-brand-icon" />
          <div className="app-shell-brand-text">
            <div className="app-shell-family-name">{famille.nom}</div>
            <div className="app-shell-user-meta">
              {user.prenom} {user.nom}
            </div>
          </div>
        </div>

        <div className="app-shell-center">
          <Segmented
            value={view}
            onChange={(value) =>
              setView(value as "list" | "tree" | "fullTree" | "admin" | "profile" | "search")
            }
            options={[
              {
                label: <span className="view-switch-label"><UnorderedListOutlined /> Liste</span>,
                value: "list",
              },
              {
                label: <span className="view-switch-label"><EyeOutlined /> Vue</span>,
                value: "tree",
                disabled: !selectedPersonId,
              },
              {
                label: <span className="view-switch-label"><ApartmentOutlined /> Arbre</span>,
                value: "fullTree",
              },
              {
                label: <span className="view-switch-label"><SearchOutlined /> Parenté</span>,
                value: "search",
              },
              {
                label: <span className="view-switch-label"><UserOutlined /> Profil</span>,
                value: "profile" as const,
              },
              ...(user.role === "admin"
                ? [
                    {
                      label: <span className="view-switch-label"><SettingOutlined /> Admin</span>,
                      value: "admin" as const,
                    },
                  ]
                : []),
            ]}
            size="middle"
            className="app-view-switch"
          />
        </div>

        <div className="app-shell-right">
          {(user.role === 'superadmin' || user.role === 'admin' || user.role === 'gestionnaire' || user.role === 'membre') && (
            <Button
              icon={<UserAddOutlined />}
              onClick={() => {
                setInviteModalVisible(true);
                chargerInvitationsEtMembres();
                setGeneratedInviteUrl("");
              }}
              size="small"
              title="Inviter un membre"
              className="invite-btn"
            >
              Inviter
            </Button>
          )}
          <Tag color="default" className="role-tag">
            {user.role}
          </Tag>
          <Button
            icon={<LogoutOutlined />}
            onClick={logout}
            size="small"
            title="Déconnexion"
            className="logout-btn"
          />
        </div>
      </Header>

      <Content className="app-shell-content">
        {view === "admin" ? (
          <AdminDashboard />
        ) : view === "list" ? (
          <div className="list-view-grid">
            {/* Colonne gauche: Formulaires */}
            <div className="list-view-left">
              {/* Formulaire d'ajout de personne */}
              <Card
                title={
                  <>
                    <UserOutlined /> Ajouter une personne
                  </>
                }
                bordered={false}
                className="glass-card"
              >
                <Form form={form} layout="vertical" onFinish={ajouterPersonne}>
                  <Form.Item
                    label="Nom"
                    name="nom"
                    rules={[
                      { required: true, message: "Veuillez entrer le nom" },
                    ]}
                  >
                    <Input placeholder="Nom de famille" />
                  </Form.Item>

                  <Form.Item
                    label="Prénom"
                    name="prenom"
                    rules={[
                      { required: true, message: "Veuillez entrer le prénom" },
                    ]}
                  >
                    <Input placeholder="Prénom" />
                  </Form.Item>

                  <Form.Item label="Date de naissance" name="dateNaissance">
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Sélectionner une date"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Sexe"
                    name="genre"
                    rules={[
                      {
                        required: true,
                        message: "Veuillez sélectionner le sexe",
                      },
                    ]}
                  >
                    <Select placeholder="Sélectionner le sexe">
                      <Select.Option value="homme">
                        <ManOutlined /> Homme
                      </Select.Option>
                      <Select.Option value="femme">
                        <WomanOutlined /> Femme
                      </Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="isDecede" valuePropName="checked">
                    <Checkbox onChange={(e) => setIsDecede(e.target.checked)}>
                      Personne décédée
                    </Checkbox>
                  </Form.Item>

                  {isDecede && (
                    <>
                      <Form.Item label="Date de décès" name="dateDeces">
                        <DatePicker
                          style={{ width: "100%" }}
                          format="DD/MM/YYYY"
                          placeholder="Date de décès"
                        />
                      </Form.Item>

                      <Form.Item label="Lieu de décès" name="lieuDeces">
                        <Input placeholder="Ex: Cote d'Ivoire, Mali, Burkina Faso" />
                      </Form.Item>
                    </>
                  )}

                  <Form.Item label="Photo de profil">
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={async (file) => {
                        const base64 = await getBase64(file);
                        setPhotoBase64(base64);
                        return false;
                      }}
                      onRemove={() => setPhotoBase64("")}
                      onPreview={() => {
                        setPreviewImage(photoBase64);
                        setPreviewOpen(true);
                      }}
                      fileList={photoBase64 ? [{
                        uid: '-1',
                        name: 'photo',
                        status: 'done',
                        url: photoBase64,
                      }] : []}
                      showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                    >
                      {!photoBase64 && (
                        <div>
                          <CameraOutlined style={{ fontSize: 24 }} />
                          <div style={{ marginTop: 8 }}>Ajouter une photo</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>

                  <div style={{ marginTop: 16, marginBottom: 8, padding: '8px 12px', background: '#f0f5ff', borderRadius: 8, color: '#6366f1', fontWeight: 500 }}>
                    👨‍👩‍👧 Parents hors famille (si non présents dans l'arbre)
                  </div>

                  <Form.Item label="Nom du père (externe)" name="pereExterne">
                    <Input placeholder="Prénom et Nom du père s'il n'est pas dans l'arbre" />
                  </Form.Item>

                  <Form.Item label="Nom de la mère (externe)" name="mereExterne">
                    <Input placeholder="Prénom et Nom de la mère si elle n'est pas dans l'arbre" />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<PlusOutlined />}
                      block
                    >
                      Ajouter
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              {/* Bouton pour afficher le formulaire de relation */}
              <Button
                type={showRelationForm ? "default" : "primary"}
                icon={<TeamOutlined />}
                onClick={() => setShowRelationForm(!showRelationForm)}
                size="large"
                block
                className="relation-toggle-btn"
              >
                {showRelationForm
                  ? "Masquer le formulaire de relation"
                  : "Ajouter une relation"}
              </Button>

              {showRelationForm && personnes.length > 0 && (
                <Card bordered={false} className="glass-card">
                  <RelationForm
                    personnes={personnes}
                    onRelationAdded={handleRelationAdded}
                  />
                </Card>
              )}
            </div>

            {/* Colonne droite: Listes */}
            <div className="list-view-right">
              {/* Liste des personnes */}
              <Card
                title={
                  <div className="card-title-row">
                    <span>
                      <UserOutlined /> Liste des personnes (
                      {personnesFiltrees.length}/{personnes.length})
                    </span>
                    <Input.Search
                      placeholder="Rechercher une personne..."
                      allowClear
                      value={searchPersonne}
                      onChange={(e) => setSearchPersonne(e.target.value)}
                      style={{ width: 250 }}
                      size="small"
                    />
                  </div>
                }
                bordered={false}
                className="glass-card split-card persons-card"
                bodyStyle={{ flex: 1, overflowY: "auto", padding: "16px" }}
              >
                <List
                  dataSource={personnesFiltrees}
                  renderItem={(personne) => {
                    const parents = getParentsInfo(personne._id);
                    return (
                      <List.Item
                        key={personne._id}
                        onClick={() => setSelectedPersonId(personne._id)}
                        className={`person-list-item ${selectedPersonId === personne._id ? "selected" : ""}`}
                      >
                        <List.Item.Meta
                          avatar={
                            personne.photo ? (
                              <Avatar size={40} src={getImageUrl(personne.photo)} />
                            ) : (
                              <Avatar
                                size={40}
                                style={{ backgroundColor: "#1976d2" }}
                              >
                                {personne.prenom[0]}
                                {personne.nom[0]}
                              </Avatar>
                            )
                          }
                          title={
                            <span>
                              {personne.prenom} {personne.nom}
                              {personne.dateDeces && (
                                <span style={{ marginLeft: 4 }}>🕊️</span>
                              )}
                              {selectedPersonId === personne._id && (
                                <Tag color="blue" style={{ marginLeft: 8 }}>Sélectionné</Tag>
                              )}
                            </span>
                          }
                          description={
                            <div>
                              <div>
                                Né(e) le:{" "}
                                {new Date(
                                  personne.dateNaissance,
                                ).toLocaleDateString("fr-FR")}
                                {personne.dateDeces && (
                                  <span style={{ marginLeft: 8, color: '#666' }}>
                                    - Décédé(e) le {new Date(personne.dateDeces).toLocaleDateString("fr-FR")}
                                    {personne.lieuDeces && ` à ${personne.lieuDeces}`}
                                  </span>
                                )}
                              </div>
                              {parents.length > 0 && (
                                <div className="person-parents-row">
                                  <span className="person-parents-label">
                                    Parents:{" "}
                                  </span>
                                  {parents.map((parent) => (
                                    <Tag
                                      key={parent._id}
                                      color="purple"
                                      style={{
                                        cursor: "pointer",
                                        fontSize: 11,
                                        marginTop: 4,
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPersonId(parent._id);
                                      }}
                                    >
                                      👨‍👩‍👦 {parent.prenom} {parent.nom}
                                    </Tag>
                                  ))}
                                </div>
                              )}
                            </div>
                          }
                        />
                        <Space>
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              ouvrirModalEdition(personne);
                            }}
                          />
                          <Popconfirm
                            title="Supprimer cette personne ?"
                            description="Cette action est irréversible. Les relations liées seront également supprimées."
                            onConfirm={(e) => {
                              e?.stopPropagation();
                              supprimerPersonne(personne._id);
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                            okText="Supprimer"
                            cancelText="Annuler"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Popconfirm>
                        </Space>
                      </List.Item>
                    );
                  }}
                />
              </Card>

              {/* Liste des relations */}
              <Card
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <TeamOutlined /> Relations familiales (
                    {relationsFiltrees.length}/{relations.length})
                    {searchPersonne && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          fontWeight: "normal",
                        }}
                      >
                        (filtrées par la recherche)
                      </span>
                    )}
                  </div>
                }
                bordered={false}
                className="glass-card split-card"
                bodyStyle={{ flex: 1, overflowY: "auto", padding: "16px" }}
              >
                {relationsFiltrees.length > 0 ? (
                  <List
                    dataSource={relationsFiltrees}
                    renderItem={(relation) => (
                      <List.Item
                        key={relation._id}
                        className="relation-list-item"
                        actions={[
                          <Popconfirm
                            title="Supprimer cette relation ?"
                            description="Cette action est irréversible."
                            onConfirm={() => supprimerRelation(relation._id)}
                            okText="Oui"
                            cancelText="Non"
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <Tag color="blue">
                                {getRelationLabel(relation.type)}
                              </Tag>
                              <span>
                                {relation.personne1.prenom}{" "}
                                {relation.personne1.nom}
                                {" → "}
                                {relation.personne2.prenom}{" "}
                                {relation.personne2.nom}
                              </span>
                              {relation.dateFin && (
                                <Tag color="red">Terminée</Tag>
                              )}
                            </Space>
                          }
                          description={
                            <>
                              {relation.dateDebut && (
                                <div>
                                  Du{" "}
                                  {new Date(
                                    relation.dateDebut,
                                  ).toLocaleDateString("fr-FR")}
                                  {relation.dateFin &&
                                    ` au ${new Date(relation.dateFin).toLocaleDateString("fr-FR")}`}
                                </div>
                              )}
                              {relation.details && (
                                <div
                                  style={{
                                    color: "#666",
                                    fontSize: "12px",
                                    marginTop: "4px",
                                  }}
                                >
                                  {relation.details}
                                </div>
                              )}
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="empty-state">Aucune relation définie</div>
                )}
              </Card>
            </div>
          </div>
        ) : view === "tree" ? (
          <div className="tree-view">
            {selectedPersonId ? (
              <FamilyTree
                people={personnes}
                relations={relations}
                rootId={selectedPersonId}
                onSelectRoot={ouvrirInfoPersonne}
              />
            ) : (
              <Card className="glass-card tree-empty-card">
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌳</div>
                <h3>Sélectionnez une personne</h3>
                <p>
                  Retournez à la vue liste et cliquez sur une personne pour
                  afficher son arbre généalogique
                </p>
              </Card>
            )}
          </div>
        ) : view === "profile" ? (
          <ProfilePage />
        ) : view === "search" ? (
          <div className="search-view">
            <RelationshipFinder
              personnes={personnes}
              relations={relations}
            />
          </div>
        ) : (
          <div className="tree-view">
            <div className="full-tree-grid">
              {personnes.map((personne) => {
                // Trouver les relations de cette personne
                const relationsPersonne = relations.filter(
                  (r) =>
                    r.personne1._id === personne._id ||
                    r.personne2._id === personne._id,
                );

                const conjoints = relationsPersonne
                  .filter((r) => r.type === "conjoint" || r.type === "mariage")
                  .map((r) =>
                    r.personne1._id === personne._id
                      ? r.personne2
                      : r.personne1,
                  );

                const enfants = relationsPersonne
                  .filter(
                    (r) =>
                      (r.type === "parent" &&
                        r.personne1._id === personne._id) ||
                      (r.type === "enfant" && r.personne2._id === personne._id),
                  )
                  .map((r) =>
                    r.type === "parent" ? r.personne2 : r.personne1,
                  );

                return (
                  <Card
                    key={personne._id}
                    hoverable
                    className="full-tree-person-card"
                    onClick={() => {
                      setSelectedPersonId(personne._id);
                      setView("tree");
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      {personne.photo ? (
                        <Avatar size={80} src={getImageUrl(personne.photo)} />
                      ) : (
                        <Avatar
                          size={80}
                          style={{ backgroundColor: "#1976d2", fontSize: 32 }}
                        >
                          {personne.prenom[0]}
                          {personne.nom[0]}
                        </Avatar>
                      )}
                      <div
                        style={{ marginTop: 12, fontWeight: 600, fontSize: 14 }}
                      >
                        {personne.prenom} {personne.nom}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#666", marginTop: 4 }}
                      >
                        {new Date(personne.dateNaissance).getFullYear()}
                      </div>

                      {/* Relations */}
                      <div style={{ marginTop: 12, fontSize: 11 }}>
                        {conjoints.length > 0 && (
                          <Tag color="pink" style={{ marginBottom: 4 }}>
                            💕 {conjoints.length} conjoint(s)
                          </Tag>
                        )}
                        {enfants.length > 0 && (
                          <Tag color="green" style={{ marginBottom: 4 }}>
                            👶 {enfants.length} enfant(s)
                          </Tag>
                        )}
                      </div>

                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        style={{ marginTop: 8 }}
                      >
                        Voir l'arbre
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </Content>

      {/* Modal d'édition */}
      <Modal
        title="Modifier une personne"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingPerson(null);
          setPhotoBase64("");
          setIsDecedeEdit(false);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={modifierPersonne}>
          <Form.Item
            label="Nom"
            name="nom"
            rules={[{ required: true, message: "Veuillez entrer le nom" }]}
          >
            <Input placeholder="Nom de famille" />
          </Form.Item>

          <Form.Item
            label="Prénom"
            name="prenom"
            rules={[{ required: true, message: "Veuillez entrer le prénom" }]}
          >
            <Input placeholder="Prénom" />
          </Form.Item>

          <Form.Item label="Date de naissance" name="dateNaissance">
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Sélectionner une date"
            />
          </Form.Item>

          <Form.Item
            label="Sexe"
            name="genre"
            rules={[
              { required: true, message: "Veuillez sélectionner le sexe" },
            ]}
          >
            <Select placeholder="Sélectionner le sexe">
              <Select.Option value="homme">
                <ManOutlined /> Homme
              </Select.Option>
              <Select.Option value="femme">
                <WomanOutlined /> Femme
              </Select.Option>
              <Select.Option value="autre">Autre</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="isDecede" valuePropName="checked">
            <Checkbox onChange={(e) => setIsDecedeEdit(e.target.checked)}>
              Personne décédée
            </Checkbox>
          </Form.Item>

          {isDecedeEdit && (
            <>
              <Form.Item label="Date de décès" name="dateDeces">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Date de décès"
                />
              </Form.Item>

              <Form.Item label="Lieu de décès" name="lieuDeces">
                <Input placeholder="Ex: Paris, France" />
              </Form.Item>
            </>
          )}

          <Form.Item label="Photo de profil">
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={async (file) => {
                const base64 = await getBase64(file);
                setPhotoBase64(base64);
                return false;
              }}
              onRemove={() => setPhotoBase64("")}
              onPreview={() => {
                setPreviewImage(photoBase64);
                setPreviewOpen(true);
              }}
              fileList={photoBase64 ? [{
                uid: '-1',
                name: 'photo',
                status: 'done',
                url: photoBase64,
              }] : []}
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            >
              {!photoBase64 && (
                <div>
                  <CameraOutlined style={{ fontSize: 24 }} />
                  <div style={{ marginTop: 8 }}>Ajouter une photo</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <div style={{ marginTop: 16, marginBottom: 8, padding: '8px 12px', background: '#f0f5ff', borderRadius: 8, color: '#6366f1', fontWeight: 500 }}>
            👨‍👩‍👧 Parents hors famille (si non présents dans l'arbre)
          </div>

          <Form.Item label="Nom du père (externe)" name="pereExterne">
            <Input placeholder="Prénom et Nom du père s'il n'est pas dans l'arbre" />
          </Form.Item>

          <Form.Item label="Nom de la mère (externe)" name="mereExterne">
            <Input placeholder="Prénom et Nom de la mère si elle n'est pas dans l'arbre" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setIsEditModalVisible(false);
                  setEditingPerson(null);
                  setPhotoBase64("");
                  editForm.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                Enregistrer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de prévisualisation d'image */}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
      >
        <img alt="Aperçu" style={{ width: '100%' }} src={previewImage} />
      </Modal>

      {/* Modal d'informations de personne */}
      <Modal
        title={null}
        open={personInfoModalVisible}
        onCancel={() => {
          setPersonInfoModalVisible(false);
          setSelectedPersonInfo(null);
        }}
        footer={null}
        width={700}
        centered
        styles={{
          body: { padding: 0 },
        }}
      >
        {selectedPersonInfo && (
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "2rem",
              color: "white",
            }}
          >
            {/* En-tête avec photo et nom */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
                marginBottom: "2rem",
              }}
            >
              {selectedPersonInfo.photo ? (
                <Avatar
                  size={120}
                  src={getImageUrl(selectedPersonInfo.photo)}
                  style={{ border: "4px solid white" }}
                />
              ) : (
                <Avatar
                  size={120}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.3)",
                    fontSize: 48,
                    border: "4px solid white",
                  }}
                >
                  {selectedPersonInfo.prenom[0]}
                  {selectedPersonInfo.nom[0]}
                </Avatar>
              )}
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    color: "white",
                    margin: 0,
                    fontSize: 32,
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {selectedPersonInfo.genre === "homme" && <ManOutlined />}
                  {selectedPersonInfo.genre === "femme" && <WomanOutlined />}
                  {selectedPersonInfo.prenom} {selectedPersonInfo.nom}
                </h2>
                <div style={{ fontSize: 18, marginTop: 8, opacity: 0.9 }}>
                  Né(e) le{" "}
                  {new Date(
                    selectedPersonInfo.dateNaissance,
                  ).toLocaleDateString("fr-FR")}
                </div>
                {selectedPersonInfo.genre && (
                  <Tag
                    color={
                      selectedPersonInfo.genre === "homme"
                        ? "blue"
                        : selectedPersonInfo.genre === "femme"
                          ? "pink"
                          : "purple"
                    }
                    style={{ marginTop: 8, fontSize: 14 }}
                  >
                    {selectedPersonInfo.genre === "homme"
                      ? "♂ Homme"
                      : selectedPersonInfo.genre === "femme"
                        ? "♀ Femme"
                        : "Autre"}
                  </Tag>
                )}
              </div>
            </div>

            {/* Informations familiales */}
            <div
              style={{
                background: "white",
                borderRadius: 12,
                padding: "1.5rem",
                color: "#333",
              }}
            >
              {/* Conjoints */}
              {(() => {
                const conjoints = getConjointsInfo(selectedPersonInfo._id);
                return (
                  conjoints.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h3
                        style={{
                          color: "#667eea",
                          marginBottom: "1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        💕 Conjoint(s)
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {conjoints.map((conjoint) => (
                          <Card
                            key={conjoint._id}
                            size="small"
                            hoverable
                            style={{ width: 200 }}
                            onClick={() => ouvrirInfoPersonne(conjoint._id)}
                          >
                            <div style={{ textAlign: "center" }}>
                              {conjoint.photo ? (
                                <Avatar size={60} src={getImageUrl(conjoint.photo)} />
                              ) : (
                                <Avatar
                                  size={60}
                                  style={{ backgroundColor: "#ff9800" }}
                                >
                                  {conjoint.prenom[0]}
                                  {conjoint.nom[0]}
                                </Avatar>
                              )}
                              <div style={{ marginTop: 8, fontWeight: 600 }}>
                                {conjoint.prenom} {conjoint.nom}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                );
              })()}

              {/* Parents */}
              {(() => {
                const parents = getParentsInfo(selectedPersonInfo._id);
                return (
                  parents.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h3
                        style={{
                          color: "#667eea",
                          marginBottom: "1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        👨‍👩‍👦 Parents
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {parents.map((parent) => (
                          <Card
                            key={parent._id}
                            size="small"
                            hoverable
                            style={{ width: 200 }}
                            onClick={() => ouvrirInfoPersonne(parent._id)}
                          >
                            <div style={{ textAlign: "center" }}>
                              {parent.photo ? (
                                <Avatar size={60} src={getImageUrl(parent.photo)} />
                              ) : (
                                <Avatar
                                  size={60}
                                  style={{ backgroundColor: "#1976d2" }}
                                >
                                  {parent.prenom[0]}
                                  {parent.nom[0]}
                                </Avatar>
                              )}
                              <div style={{ marginTop: 8, fontWeight: 600 }}>
                                {parent.prenom} {parent.nom}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                );
              })()}

              {/* Enfants */}
              {(() => {
                const enfants = getEnfantsInfo(selectedPersonInfo._id);
                return (
                  enfants.length > 0 && (
                    <div>
                      <h3
                        style={{
                          color: "#667eea",
                          marginBottom: "1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        👶 Enfants ({enfants.length})
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {enfants.map((enfant) => (
                          <Card
                            key={enfant._id}
                            size="small"
                            hoverable
                            style={{ width: 200 }}
                            onClick={() => ouvrirInfoPersonne(enfant._id)}
                          >
                            <div style={{ textAlign: "center" }}>
                              {enfant.photo ? (
                                <Avatar size={60} src={getImageUrl(enfant.photo)} />
                              ) : (
                                <Avatar
                                  size={60}
                                  style={{ backgroundColor: "#4caf50" }}
                                >
                                  {enfant.prenom[0]}
                                  {enfant.nom[0]}
                                </Avatar>
                              )}
                              <div style={{ marginTop: 8, fontWeight: 600 }}>
                                {enfant.prenom} {enfant.nom}
                              </div>
                              <div style={{ fontSize: 11, color: "#666" }}>
                                {new Date(enfant.dateNaissance).getFullYear()}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                );
              })()}

              {/* Message si pas de relations */}
              {(() => {
                const conjoints = getConjointsInfo(selectedPersonInfo._id);
                const parents = getParentsInfo(selectedPersonInfo._id);
                const enfants = getEnfantsInfo(selectedPersonInfo._id);
                return (
                  conjoints.length === 0 &&
                  parents.length === 0 &&
                  enfants.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#999",
                      }}
                    >
                      Aucune relation familiale enregistrée
                    </div>
                  )
                );
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal d'invitation */}
      <Modal
        title={
          <>
            <UserAddOutlined /> Inviter des membres
          </>
        }
        open={inviteModalVisible}
        onCancel={() => {
          setInviteModalVisible(false);
          setGeneratedInviteUrl("");
          inviteForm.resetFields();
        }}
        footer={null}
        width={700}
        className="invite-modal"
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      >
        <div className="invite-modal-content" style={{ display: 'flex', gap: '24px' }}>
          {/* Partie gauche: Créer invitation */}
          <div className="invite-modal-left" style={{ flex: 1 }}>
            <h4 style={{ marginBottom: 16 }}>
              <LinkOutlined /> Créer un lien d'invitation
            </h4>
            <Form form={inviteForm} layout="vertical" onFinish={creerInvitation}>
              <Form.Item 
                label="Email (optionnel)" 
                name="email"
                help="Laisser vide pour un lien utilisable par n'importe qui"
              >
                <Input placeholder="email@exemple.com" />
              </Form.Item>

              <Form.Item label="Rôle" name="role" initialValue="membre">
                <Select>
                  <Select.Option value="membre">
                    <TeamOutlined /> Membre (peut ajouter des personnes)
                  </Select.Option>
                  <Select.Option value="lecteur">
                    <EyeOutlined /> Lecteur (consultation uniquement)
                  </Select.Option>
                </Select>
              </Form.Item>

              <Button 
                type="primary" 
                htmlType="submit" 
                loading={inviteLoading}
                icon={<PlusOutlined />}
              >
                Générer le lien
              </Button>
            </Form>

            {generatedInviteUrl && (
              <div style={{ 
                marginTop: 16, 
                padding: 12, 
                background: '#f5f5f5', 
                borderRadius: 8,
                wordBreak: 'break-all'
              }}>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>
                  Lien d'invitation créé :
                </div>
                <Input.Group compact>
                  <Input 
                    value={generatedInviteUrl} 
                    readOnly 
                    style={{ width: 'calc(100% - 40px)' }}
                  />
                  <Button 
                    icon={<CopyOutlined />} 
                    onClick={copierLienInvitation}
                    title="Copier"
                  />
                </Input.Group>
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  Ce lien expire dans 7 jours
                </div>
              </div>
            )}
          </div>

          {/* Partie droite: Membres actuels */}
          <div className="invite-modal-right" style={{ flex: 1, borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
            <h4 style={{ marginBottom: 16 }}>
              <TeamOutlined /> Membres de la famille ({members.length})
            </h4>
            <List
              size="small"
              dataSource={members}
              renderItem={(member: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: (member.role === 'superadmin' || member.role === 'admin' || member.role === 'gestionnaire') ? '#f56a00' : '#87d068' }}>
                        {member.prenom?.[0]}{member.nom?.[0]}
                      </Avatar>
                    }
                    title={`${member.prenom} ${member.nom}`}
                    description={
                      <Space>
                        <span style={{ fontSize: 12 }}>{member.email}</span>
                        <Tag color={(member.role === 'superadmin' || member.role === 'admin' || member.role === 'gestionnaire') ? 'red' : member.role === 'membre' ? 'blue' : 'default'} style={{ fontSize: 10 }}>
                          {member.role === 'gestionnaire' ? 'Admin famille' : (member.role === 'superadmin' || member.role === 'admin') ? 'Administrateur' : member.role}
                        </Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />

            {/* Invitations en attente */}
            {invitations.filter((i: any) => i.isActive).length > 0 && (
              <>
                <h4 style={{ marginTop: 24, marginBottom: 16 }}>
                  Invitations en attente
                </h4>
                <List
                  size="small"
                  dataSource={invitations.filter((i: any) => i.isActive)}
                  renderItem={(inv: any) => (
                    <List.Item
                      actions={(user.role === 'superadmin' || user.role === 'admin' || user.role === 'gestionnaire') ? [
                        <Popconfirm
                          title="Révoquer cette invitation ?"
                          onConfirm={() => revoquerInvitation(inv._id)}
                          okText="Oui"
                          cancelText="Non"
                        >
                          <Button type="link" danger size="small">
                            <DeleteOutlined />
                          </Button>
                        </Popconfirm>
                      ] : []}
                    >
                      <List.Item.Meta
                        title={inv.email || 'Lien ouvert'}
                        description={
                          <Space>
                            <Tag>{inv.role}</Tag>
                            <span style={{ fontSize: 11 }}>
                              Expire le {new Date(inv.expiresAt).toLocaleDateString('fr-FR')}
                            </span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </>
            )}
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default App;
