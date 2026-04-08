// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Button, Card, List, Form, Input, DatePicker, Space, Tag, Popconfirm, message, Segmented } from 'antd';
import { UserOutlined, TeamOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, UnorderedListOutlined, ApartmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'antd/dist/reset.css';
import './App.css';
import RelationForm from './components/RelationForm';
import FamilyTree from './components/FamilyTree';

const { Header, Content } = Layout;

interface Personne {
  _id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
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
  details?: string;
}

function App() {
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [showRelationForm, setShowRelationForm] = useState(false);
  const [view, setView] = useState<'list' | 'tree'>('list');
  const [form] = Form.useForm();

  // Charger les personnes
  const chargerPersonnes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/personnes`);
      const data = await response.json();
      setPersonnes(data);
    } catch (error) {
      console.error('Erreur lors du chargement des personnes:', error);
      message.error('Erreur lors du chargement des personnes');
    }
  };

  // Charger les relations
  const chargerRelations = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/relations`);
      const data = await response.json();
      setRelations(data);
    } catch (error) {
      console.error('Erreur lors du chargement des relations:', error);
      message.error('Erreur lors du chargement des relations');
    }
  };

  // Charger les données au démarrage
  useEffect(() => {
    chargerPersonnes();
    chargerRelations();
  }, []);

  // Gestionnaire d'ajout de personne
  const ajouterPersonne = async (values: any) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/personnes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: values.nom,
          prenom: values.prenom,
          dateNaissance: values.dateNaissance ? values.dateNaissance.format('YYYY-MM-DD') : undefined
        }),
      });
      
      if (response.ok) {
        await chargerPersonnes();
        form.resetFields();
        message.success('Personne ajoutée avec succès');
      } else {
        message.error('Erreur lors de l\'ajout de la personne');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la personne:', error);
      message.error('Erreur lors de l\'ajout de la personne');
    }
  };

  // Gestionnaire d'ajout de relation
  const handleRelationAdded = async () => {
    await chargerRelations();
    message.success('Relation ajoutée avec succès');
  };

  // Gestionnaire de suppression de relation
  const supprimerRelation = async (relationId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/relations/${relationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await chargerRelations();
        message.success('Relation supprimée avec succès');
      } else {
        message.error('Erreur lors de la suppression de la relation');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la relation:', error);
      message.error('Erreur lors de la suppression de la relation');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#1976d2', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ApartmentOutlined style={{ fontSize: '28px', color: 'white' }} />
          <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>Arbre Généalogique</h1>
        </div>
        <Segmented
          value={view}
          onChange={(value) => setView(value as 'list' | 'tree')}
          options={[
            {
              label: (
                <div style={{ padding: '4px 8px' }}>
                  <UnorderedListOutlined /> Vue Liste
                </div>
              ),
              value: 'list',
            },
            {
              label: (
                <div style={{ padding: '4px 8px' }}>
                  <EyeOutlined /> Vue Arbre
                </div>
              ),
              value: 'tree',
              disabled: !selectedPersonId
            },
          ]}
          size="large"
        />
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        {view === 'list' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            {/* Colonne gauche: Formulaires */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Formulaire d'ajout de personne */}
              <Card 
                title={<><UserOutlined /> Ajouter une personne</>}
                bordered={false}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={ajouterPersonne}
                >
                  <Form.Item
                    label="Nom"
                    name="nom"
                    rules={[{ required: true, message: 'Veuillez entrer le nom' }]}
                  >
                    <Input placeholder="Nom de famille" />
                  </Form.Item>

                  <Form.Item
                    label="Prénom"
                    name="prenom"
                    rules={[{ required: true, message: 'Veuillez entrer le prénom' }]}
                  >
                    <Input placeholder="Prénom" />
                  </Form.Item>

                  <Form.Item
                    label="Date de naissance"
                    name="dateNaissance"
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      placeholder="Sélectionner une date"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                      Ajouter
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              {/* Bouton pour afficher le formulaire de relation */}
              <Button
                type={showRelationForm ? 'default' : 'primary'}
                icon={<TeamOutlined />}
                onClick={() => setShowRelationForm(!showRelationForm)}
                size="large"
                block
              >
                {showRelationForm ? 'Masquer le formulaire de relation' : 'Ajouter une relation'}
              </Button>

              {showRelationForm && personnes.length > 0 && (
                <Card bordered={false}>
                  <RelationForm
                    personnes={personnes}
                    onRelationAdded={handleRelationAdded}
                  />
                </Card>
              )}
            </div>

            {/* Colonne droite: Listes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Liste des personnes */}
              <Card 
                title={<><UserOutlined /> Liste des personnes ({personnes.length})</>}
                bordered={false}
                style={{ maxHeight: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, overflow: 'auto', padding: '12px' }}
              >
                <List
                  dataSource={personnes}
                  renderItem={(personne) => (
                    <List.Item
                      key={personne._id}
                      onClick={() => setSelectedPersonId(personne._id)}
                      style={{
                        cursor: 'pointer',
                        background: selectedPersonId === personne._id ? '#e6f7ff' : 'white',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        padding: '12px',
                        border: selectedPersonId === personne._id ? '2px solid #1976d2' : '1px solid #f0f0f0',
                        transition: 'all 0.3s'
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: '#1976d2',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: 'bold'
                          }}>
                            {personne.prenom[0]}{personne.nom[0]}
                          </div>
                        }
                        title={
                          <Space>
                            {personne.prenom} {personne.nom}
                            {selectedPersonId === personne._id && (
                              <Tag color="blue">Sélectionné</Tag>
                            )}
                          </Space>
                        }
                        description={`Né(e) le: ${new Date(personne.dateNaissance).toLocaleDateString('fr-FR')}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>

              {/* Liste des relations */}
              <Card 
                title={<><TeamOutlined /> Relations familiales ({relations.length})</>}
                bordered={false}
                style={{ maxHeight: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, overflow: 'auto', padding: '12px' }}
              >
                {relations.length > 0 ? (
                  <List
                    dataSource={relations}
                    renderItem={(relation) => (
                      <List.Item
                        key={relation._id}
                        style={{
                          background: 'white',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          padding: '12px',
                          border: '1px solid #f0f0f0'
                        }}
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
                          </Popconfirm>
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <Tag color="blue">{relation.type}</Tag>
                              <span>
                                {relation.personne1.prenom} {relation.personne1.nom}
                                {' → '}
                                {relation.personne2.prenom} {relation.personne2.nom}
                              </span>
                            </Space>
                          }
                          description={
                            relation.dateDebut && 
                            `Depuis le ${new Date(relation.dateDebut).toLocaleDateString('fr-FR')}`
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    Aucune relation définie
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <div className="tree-view">
            {selectedPersonId ? (
              <FamilyTree 
                people={personnes} 
                relations={relations}
                rootId={selectedPersonId} 
              />
            ) : (
              <Card style={{ textAlign: 'center', marginTop: '50px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌳</div>
                <h3>Sélectionnez une personne</h3>
                <p>Retournez à la vue liste et cliquez sur une personne pour afficher son arbre généalogique</p>
              </Card>
            )}
          </div>
        )}
      </Content>
    </Layout>
  );
}

export default App;
