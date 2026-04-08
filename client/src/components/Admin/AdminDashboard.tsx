// src/components/Admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tabs, Card, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import apiService from '../../services/apiService';
import './AdminDashboard.css';

interface User {
  _id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  familleId: {
    _id: string;
    nom: string;
  } | null;
  createdAt: string;
}

interface Famille {
  _id: string;
  nom: string;
  description: string;
  createdBy: {
    _id: string;
    nom: string;
    prenom: string;
  };
  createdAt: string;
}

const { TabPane } = Tabs;
const { Option } = Select;

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [familles, setFamilles] = useState<Famille[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [familleModalVisible, setFamilleModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [familleForm] = Form.useForm();

  // Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/admin/users');
      const data = response?.data || response;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      message.error(error.message || 'Erreur lors du chargement des utilisateurs');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les familles
  const fetchFamilles = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/admin/familles');
      const data = response?.data || response;
      setFamilles(Array.isArray(data) ? data : []);
    } catch (error: any) {
      message.error(error.message || 'Erreur lors du chargement des familles');
      setFamilles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchFamilles();
  }, []);

  // Créer ou modifier un utilisateur
  const handleUserSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (editingUser) {
        // Mise à jour
        await apiService.put(`/api/admin/users/${editingUser._id}`, values);
        message.success('Utilisateur mis à jour');
      } else {
        // Création
        await apiService.post('/api/admin/users', values);
        message.success('Utilisateur créé avec succès');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  // Créer une famille
  const handleFamilleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await apiService.post('/api/admin/familles', values);
      message.success('Famille créée avec succès');
      setFamilleModalVisible(false);
      familleForm.resetFields();
      fetchFamilles();
    } catch (error: any) {
      message.error(error.message || 'Erreur lors de la création de la famille');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId: string) => {
    try {
      await apiService.delete(`/api/admin/users/${userId}`);
      message.success('Utilisateur supprimé');
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || 'Erreur lors de la suppression');
    }
  };

  // Supprimer une famille
  const handleDeleteFamille = async (familleId: string) => {
    try {
      await apiService.delete(`/api/admin/familles/${familleId}`);
      message.success('Famille supprimée');
      fetchFamilles();
      fetchUsers(); // Recharger aussi les users car ils peuvent être affectés
    } catch (error: any) {
      message.error(error.message || 'Erreur lors de la suppression');
    }
  };

  // Ouvrir le modal d'édition
  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      familleId: user.familleId?._id
    });
    setModalVisible(true);
  };

  // Colonnes du tableau des utilisateurs
  const userColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Prénom',
      dataIndex: 'prenom',
      key: 'prenom',
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: (role === 'superadmin' || role === 'gestionnaire') ? '#e6f7ff' : '#f0f0f0',
          color: (role === 'superadmin' || role === 'gestionnaire') ? '#1890ff' : '#666'
        }}>
          {role === 'gestionnaire' ? 'Admin famille' : role === 'superadmin' ? 'Super admin' : role}
        </span>
      )
    },
    {
      title: 'Famille',
      dataIndex: ['familleId', 'nom'],
      key: 'famille',
      render: (nom: string) => nom || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Modifier
          </Button>
          <Popconfirm
            title="Supprimer cet utilisateur ?"
            description="Cette action est irréversible."
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            >
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Colonnes du tableau des familles
  const familleColumns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => desc || '-'
    },
    {
      title: 'Créé par',
      dataIndex: ['createdBy'],
      key: 'createdBy',
      render: (creator: any) => creator ? `${creator.prenom} ${creator.nom}` : '-'
    },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Famille) => (
        <Popconfirm
          title="Supprimer cette famille ?"
          description="Attention : tous les utilisateurs et données associés seront supprimés."
          onConfirm={() => handleDeleteFamille(record._id)}
          okText="Oui"
          cancelText="Non"
        >
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
          >
            Supprimer
          </Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🎛️ Tableau de bord administrateur</h1>
      </div>

      <Tabs defaultActiveKey="users" className="admin-tabs">
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              Utilisateurs ({users.length})
            </span>
          } 
          key="users"
        >
          <Card>
            <div className="table-header">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingUser(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
              >
                Créer un utilisateur
              </Button>
            </div>
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              Familles ({familles.length})
            </span>
          } 
          key="familles"
        >
          <Card>
            <div className="table-header">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  familleForm.resetFields();
                  setFamilleModalVisible(true);
                }}
              >
                Créer une famille
              </Button>
            </div>
            <Table
              columns={familleColumns}
              dataSource={familles}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Modal Utilisateur */}
      <Modal
        title={editingUser ? 'Modifier un utilisateur' : 'Créer un utilisateur'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUserSubmit}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email requis' },
              { type: 'email', message: 'Email invalide' }
            ]}
          >
            <Input placeholder="utilisateur@email.com" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="Mot de passe"
              name="password"
              rules={[
                { required: true, message: 'Mot de passe requis' },
                { min: 6, message: 'Minimum 6 caractères' }
              ]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>
          )}

          <Form.Item
            label="Nom"
            name="nom"
            rules={[{ required: true, message: 'Nom requis' }]}
          >
            <Input placeholder="Dupont" />
          </Form.Item>

          <Form.Item
            label="Prénom"
            name="prenom"
            rules={[{ required: true, message: 'Prénom requis' }]}
          >
            <Input placeholder="Jean" />
          </Form.Item>

          <Form.Item
            label="Rôle"
            name="role"
            rules={[{ required: true, message: 'Rôle requis' }]}
          >
            <Select placeholder="Sélectionner un rôle">
              <Option value="admin">Admin</Option>
              <Option value="membre">Membre</Option>
              <Option value="lecteur">Lecteur</Option>
            </Select>
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="Nom de la famille"
              name="nomFamille"
              rules={[{ required: true, message: 'Nom de la famille requis' }]}
              help="Une nouvelle famille sera créée pour cet utilisateur"
            >
              <Input placeholder="Famille Dupont" />
            </Form.Item>
          )}

          {editingUser && (
            <Form.Item
              label="Famille"
              name="familleId"
              rules={[{ required: true, message: 'Famille requise' }]}
            >
              <Select placeholder="Sélectionner une famille">
                {familles.map(f => (
                  <Option key={f._id} value={f._id}>{f.nom}</Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUser ? 'Modifier' : 'Créer'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingUser(null);
                form.resetFields();
              }}>
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Famille */}
      <Modal
        title="Créer une famille"
        open={familleModalVisible}
        onCancel={() => {
          setFamilleModalVisible(false);
          familleForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={familleForm}
          layout="vertical"
          onFinish={handleFamilleSubmit}
        >
          <Form.Item
            label="Nom de la famille"
            name="nom"
            rules={[{ required: true, message: 'Nom requis' }]}
          >
            <Input placeholder="Famille Dupont" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea 
              placeholder="Description de la famille (optionnel)" 
              rows={4}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Créer
              </Button>
              <Button onClick={() => {
                setFamilleModalVisible(false);
                familleForm.resetFields();
              }}>
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
