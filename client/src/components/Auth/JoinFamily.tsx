// src/components/Auth/JoinFamily.tsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin, Typography, Tag } from 'antd';
import { UserAddOutlined, TeamOutlined, MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import apiService from '../../services/apiService';
import './Auth.css';

const { Title, Text } = Typography;

interface JoinFamilyProps {
  invitationCode: string;
  onJoinSuccess: (token: string, user: any, famille: any) => void;
  onCancel: () => void;
}

interface InvitationInfo {
  valid: boolean;
  famille: {
    nom: string;
    description?: string;
  };
  role: string;
  email?: string;
  expiresAt: string;
}

const JoinFamily: React.FC<JoinFamilyProps> = ({ invitationCode, onJoinSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Vérifier l'invitation au chargement
  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        const response = await apiService.get(`/api/invitations/verify/${invitationCode}`);
        if (response.success) {
          setInvitationInfo(response.data);
          // Si un email est spécifié dans l'invitation, le pré-remplir
          if (response.data.email) {
            form.setFieldValue('email', response.data.email);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invitation invalide ou expirée');
      } finally {
        setVerifying(false);
      }
    };

    verifyInvitation();
  }, [invitationCode, form]);

  const handleJoin = async (values: any) => {
    setLoading(true);
    try {
      const response = await apiService.post(`/api/invitations/join/${invitationCode}`, {
        email: values.email,
        password: values.password,
        nom: values.nom,
        prenom: values.prenom
      });

      if (response.success) {
        message.success(response.message || 'Bienvenue dans la famille !');
        onJoinSuccess(response.data.token, response.data.user, response.data.famille);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="auth-container">
        <Card className="auth-card" bordered={false}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <Text style={{ display: 'block', marginTop: 16 }}>Vérification de l'invitation...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !invitationInfo) {
    return (
      <div className="auth-container">
        <Card className="auth-card" bordered={false}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Title level={3} style={{ color: '#ff4d4f' }}>Invitation invalide</Title>
            <Text type="secondary">{error || 'Cette invitation n\'existe pas ou a expiré.'}</Text>
            <div style={{ marginTop: 24 }}>
              <Button type="primary" onClick={onCancel}>
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Card className="auth-card" bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <TeamOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          <Title level={3} style={{ marginTop: 16, marginBottom: 8 }}>
            Rejoindre la famille {invitationInfo.famille.nom}
          </Title>
          {invitationInfo.famille.description && (
            <Text type="secondary">{invitationInfo.famille.description}</Text>
          )}
          <div style={{ marginTop: 12 }}>
            <Tag color={invitationInfo.role === 'membre' ? 'blue' : 'default'}>
              Rôle: {invitationInfo.role}
            </Tag>
          </div>
        </div>

        <Form
          form={form}
          name="join"
          layout="vertical"
          onFinish={handleJoin}
          autoComplete="off"
        >
          <Form.Item
            name="prenom"
            rules={[{ required: true, message: 'Veuillez entrer votre prénom' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Prénom" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="nom"
            rules={[{ required: true, message: 'Veuillez entrer votre nom' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Nom de famille" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Veuillez entrer votre email' },
              { type: 'email', message: 'Email invalide' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
              size="large"
              disabled={!!invitationInfo.email}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Veuillez créer un mot de passe' },
              { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Mot de passe (min. 8 caractères)" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Veuillez confirmer le mot de passe' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirmer le mot de passe" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
              icon={<UserAddOutlined />}
            >
              Rejoindre la famille
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={onCancel}>
              Retour à la connexion
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default JoinFamily;
