// src/components/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  message,
  Space,
  Tag,
  List,
  Popconfirm,
  Typography,
  Tabs,
  Alert,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SaveOutlined,
  CopyOutlined,
  LinkOutlined,
  DeleteOutlined,
  TeamOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import './ProfilePage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Invitation {
  _id: string;
  email?: string;
  role: string;
  status: string;
  url: string;
  createdAt: string;
  expiresAt: string;
}

const ProfilePage: React.FC = () => {
  const { user, famille } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [familleForm] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [familleLoading, setFamilleLoading] = useState(false);
  
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [inviteForm] = Form.useForm();

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      });
    }
    if (famille) {
      familleForm.setFieldsValue({
        nomFamille: famille.nom,
        description: famille.description,
      });
    }
    chargerInvitations();
  }, [user, famille, profileForm, familleForm]);

  const chargerInvitations = async () => {
    try {
      const response = await apiService.get('/api/invitations');
      if (response.success && Array.isArray(response.data)) {
        setInvitations(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement invitations:', error);
    }
  };

  // Mettre à jour le profil
  const updateProfile = async (values: any) => {
    setLoading(true);
    try {
      const response = await apiService.put('/api/auth/profile', {
        nom: values.nom,
        prenom: values.prenom,
        email: values.email,
      });
      
      if (response.success) {
        message.success('Profil mis à jour avec succès !');
        // Mettre à jour le localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...values };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // Changer le mot de passe
  const changePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    setPasswordLoading(true);
    try {
      const response = await apiService.put('/api/auth/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      if (response.success) {
        message.success('Mot de passe modifié avec succès !');
        passwordForm.resetFields();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Mettre à jour la famille
  const updateFamille = async (values: any) => {
    setFamilleLoading(true);
    try {
      const response = await apiService.put('/api/famille', {
        nom: values.nomFamille,
        description: values.description,
      });
      
      if (response.success) {
        message.success('Informations de la famille mises à jour !');
        // Mettre à jour le localStorage
        const currentFamille = JSON.parse(localStorage.getItem('famille') || '{}');
        const updatedFamille = { ...currentFamille, nom: values.nomFamille, description: values.description };
        localStorage.setItem('famille', JSON.stringify(updatedFamille));
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setFamilleLoading(false);
    }
  };

  // Créer une invitation
  const creerInvitation = async (values: any) => {
    setInviteLoading(true);
    try {
      const response = await apiService.post('/api/invitations', {
        email: values.email || undefined,
        role: 'membre',
      });
      
      if (response.success) {
        setGeneratedUrl(response.data.invitation.url);
        message.success('Lien d\'invitation créé !');
        chargerInvitations();
        inviteForm.resetFields();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setInviteLoading(false);
    }
  };

  // Copier le lien
  const copierLien = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success('Lien copié dans le presse-papier !');
  };

  // Révoquer une invitation
  const revoquerInvitation = async (id: string) => {
    try {
      await apiService.delete(`/api/invitations/${id}`);
      message.success('Invitation révoquée');
      chargerInvitations();
    } catch (error) {
      message.error('Erreur lors de la révocation');
    }
  };

  const canInvite = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'gestionnaire' || user?.role === 'membre';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Avatar size={80} className="profile-avatar">
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </Avatar>
        <div className="profile-header-info">
          <Title level={3} className="profile-name">
            {user?.prenom} {user?.nom}
          </Title>
          <Tag color={(user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'gestionnaire') ? 'gold' : 'blue'} className="profile-role">
            {user?.role === 'gestionnaire' ? 'Admin famille' : (user?.role === 'superadmin' || user?.role === 'admin') ? 'Administrateur' : 'Membre'}
          </Tag>
          <Text type="secondary" className="profile-famille">
            Famille {famille?.nom}
          </Text>
        </div>
      </div>

      <Tabs defaultActiveKey="profile" className="profile-tabs">
        <TabPane
          tab={<span><UserOutlined /> Mon Profil</span>}
          key="profile"
        >
          <div className="profile-tab-content">
            <Card className="profile-card" title={<span><EditOutlined /> Informations personnelles</span>}>
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={updateProfile}
              >
                <div className="form-row">
                  <Form.Item
                    name="prenom"
                    label="Prénom"
                    rules={[{ required: true, message: 'Prénom requis' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Votre prénom" />
                  </Form.Item>
                  <Form.Item
                    name="nom"
                    label="Nom"
                    rules={[{ required: true, message: 'Nom requis' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Votre nom" />
                  </Form.Item>
                </div>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Email requis' },
                    { type: 'email', message: 'Email invalide' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="votre@email.com" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    className="profile-save-btn"
                  >
                    Enregistrer les modifications
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            <Card className="profile-card" title={<span><LockOutlined /> Changer le mot de passe</span>}>
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={changePassword}
              >
                <Form.Item
                  name="currentPassword"
                  label="Mot de passe actuel"
                  rules={[{ required: true, message: 'Mot de passe actuel requis' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                </Form.Item>
                <div className="form-row">
                  <Form.Item
                    name="newPassword"
                    label="Nouveau mot de passe"
                    rules={[
                      { required: true, message: 'Nouveau mot de passe requis' },
                      { min: 6, message: 'Minimum 6 caractères' },
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirmer le mot de passe"
                    rules={[{ required: true, message: 'Confirmation requise' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                  </Form.Item>
                </div>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={passwordLoading}
                    icon={<LockOutlined />}
                    className="profile-save-btn"
                  >
                    Changer le mot de passe
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </TabPane>

        <TabPane
          tab={<span><TeamOutlined /> Ma Famille</span>}
          key="famille"
        >
          <div className="profile-tab-content">
            <Card className="profile-card" title={<span><EditOutlined /> Informations de la famille</span>}>
              <Form
                form={familleForm}
                layout="vertical"
                onFinish={updateFamille}
              >
                <Form.Item
                  name="nomFamille"
                  label="Nom de la famille"
                  rules={[{ required: true, message: 'Nom de famille requis' }]}
                >
                  <Input prefix={<TeamOutlined />} placeholder="Nom de votre famille" />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <Input.TextArea 
                    placeholder="Une brève description de votre famille..."
                    rows={3}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={familleLoading}
                    icon={<SaveOutlined />}
                    className="profile-save-btn"
                  >
                    Enregistrer les modifications
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </TabPane>

        {canInvite && (
          <TabPane
            tab={<span><LinkOutlined /> Invitations</span>}
            key="invitations"
          >
            <div className="profile-tab-content">
              <Card className="profile-card" title={<span><LinkOutlined /> Créer un lien d'invitation</span>}>
                <Alert
                  message="Inviter des membres"
                  description="Créez un lien d'invitation pour permettre à d'autres membres de rejoindre votre arbre généalogique. Le lien est valide pendant 7 jours."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Form
                  form={inviteForm}
                  layout="vertical"
                  onFinish={creerInvitation}
                >
                  <Form.Item
                    name="email"
                    label="Email du destinataire (optionnel)"
                    rules={[{ type: 'email', message: 'Email invalide' }]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      placeholder="email@exemple.com (laisser vide pour un lien générique)"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={inviteLoading}
                      icon={<LinkOutlined />}
                      className="profile-save-btn"
                    >
                      Générer le lien d'invitation
                    </Button>
                  </Form.Item>
                </Form>

                {generatedUrl && (
                  <div className="generated-url-box">
                    <Text strong>Lien d'invitation généré :</Text>
                    <div className="url-copy-row">
                      <Input value={generatedUrl} readOnly className="url-input" />
                      <Tooltip title="Copier le lien">
                        <Button
                          type="primary"
                          icon={<CopyOutlined />}
                          onClick={() => copierLien(generatedUrl)}
                        >
                          Copier
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </Card>

              <Card 
                className="profile-card" 
                title={<span><TeamOutlined /> Mes invitations ({invitations.length})</span>}
              >
                {invitations.length > 0 ? (
                  <List
                    dataSource={invitations}
                    renderItem={(invitation) => (
                      <List.Item
                        key={invitation._id}
                        className="invitation-item"
                        actions={[
                          <Tooltip title="Copier le lien">
                            <Button
                              type="text"
                              icon={<CopyOutlined />}
                              onClick={() => copierLien(invitation.url)}
                            />
                          </Tooltip>,
                          <Popconfirm
                            title="Révoquer cette invitation ?"
                            onConfirm={() => revoquerInvitation(invitation._id)}
                            okText="Oui"
                            cancelText="Non"
                          >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                          </Popconfirm>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              icon={invitation.status === 'used' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                              style={{ 
                                backgroundColor: invitation.status === 'used' ? '#52c41a' : '#1890ff' 
                              }}
                            />
                          }
                          title={
                            <Space>
                              {invitation.email || 'Lien générique'}
                              <Tag color={invitation.status === 'used' ? 'green' : 'blue'}>
                                {invitation.status === 'used' ? 'Utilisée' : 'En attente'}
                              </Tag>
                            </Space>
                          }
                          description={
                            <Text type="secondary">
                              Créée le {new Date(invitation.createdAt).toLocaleDateString('fr-FR')}
                              {' • '}
                              Expire le {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="empty-invitations">
                    <LinkOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
                    <Paragraph type="secondary">
                      Vous n'avez pas encore créé d'invitation
                    </Paragraph>
                  </div>
                )}
              </Card>
            </div>
          </TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default ProfilePage;
