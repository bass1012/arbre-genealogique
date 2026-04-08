// src/components/RelationForm.tsx
import React, { useState, useMemo } from 'react';
import { Form, Select, DatePicker, Input, Button, Alert, Space, Divider, Tag } from 'antd';
import {
  HeartOutlined,
  UserOutlined,
  SwapOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  ManOutlined,
  WomanOutlined,
  LinkOutlined
} from '@ant-design/icons';
import './RelationForm.css';
import apiService from '../services/apiService';

const { TextArea } = Input;
const { Option } = Select;

interface Personne {
  _id: string;
  nom: string;
  prenom: string;
  genre?: 'homme' | 'femme' | 'autre';
}

interface RelationFormProps {
  personnes: Personne[];
  onRelationAdded: () => void;
}

const RelationForm: React.FC<RelationFormProps> = ({ personnes, onRelationAdded }) => {
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Trier les personnes par ordre alphabétique
  const personnesTriees = useMemo(() => {
    return [...personnes].sort((a, b) => {
      const nomCompare = a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
      if (nomCompare !== 0) return nomCompare;
      return a.prenom.localeCompare(b.prenom, 'fr', { sensitivity: 'base' });
    });
  }, [personnes]);

  const handleSubmit = async (values: any) => {
    setError(null);
    setLoading(true);
    try {
      await apiService.post('/api/relations', {
        type: values.type,
        personne1: values.personne1,
        personne2: values.personne2,
        dateDebut: values.dateDebut ? values.dateDebut.format('YYYY-MM-DD') : undefined,
        details: values.details || undefined
      });

      onRelationAdded();
      form.resetFields();
    } catch (error: any) {
      console.error('Erreur lors de la création de la relation:', error);
      const errorMessage = error.message || 'Erreur lors de la création de la relation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const swapPersons = () => {
    const p1 = form.getFieldValue('personne1');
    const p2 = form.getFieldValue('personne2');
    form.setFieldsValue({
      personne1: p2,
      personne2: p1
    });
  };

  const relationTypes = [
    { value: 'parent', label: 'Parent → Enfant', icon: '👨‍👧', description: 'Personne 1 est parent de Personne 2' },
    { value: 'enfant', label: 'Enfant → Parent', icon: '👶', description: 'Personne 1 est enfant de Personne 2' },
    { value: 'conjoint', label: 'Conjoint', icon: '💕', description: 'Mariage, union libre, PACS...' },
    { value: 'frere_soeur', label: 'Frère / Sœur', icon: '👫', description: 'Même parents' },
  ];

  const filterOption = (input: string, option: any) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  return (
    <div className="relation-form-modern">
      <div className="relation-form-header">
        <LinkOutlined className="header-icon" />
        <span>Créer une relation</span>
      </div>
      
      {error && (
        <Alert
          message="Erreur"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="relation-form-content"
      >
        {/* Type de relation */}
        <Form.Item
          name="type"
          label={<span><TeamOutlined /> Type de relation</span>}
          rules={[{ required: true, message: 'Sélectionnez un type de relation' }]}
          initialValue="parent"
        >
          <Select
            placeholder="Choisir le type de relation"
            size="large"
            className="relation-type-select"
          >
            {relationTypes.map(type => (
              <Option key={type.value} value={type.value}>
                <div className="relation-type-option">
                  <span className="relation-type-icon">{type.icon}</span>
                  <div className="relation-type-info">
                    <span className="relation-type-label">{type.label}</span>
                    <span className="relation-type-desc">{type.description}</span>
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Sélection des personnes */}
        <div className="persons-selection">
          <Form.Item
            name="personne1"
            label={<span><UserOutlined /> Personne 1</span>}
            rules={[{ required: true, message: 'Sélectionnez une personne' }]}
            className="person-select-item"
          >
            <Select
              showSearch
              placeholder="Rechercher une personne..."
              optionFilterProp="children"
              filterOption={filterOption}
              size="large"
              suffixIcon={<UserOutlined />}
            >
              {personnesTriees.map(p => (
                <Option key={p._id} value={p._id} label={`${p.prenom} ${p.nom}`}>
                  <Space>
                    {p.genre === 'homme' ? <ManOutlined style={{ color: '#3b82f6' }} /> : 
                     p.genre === 'femme' ? <WomanOutlined style={{ color: '#ec4899' }} /> : 
                     <UserOutlined />}
                    {p.prenom} {p.nom}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Button
            type="text"
            icon={<SwapOutlined />}
            onClick={swapPersons}
            className="swap-persons-btn"
            title="Inverser les personnes"
          />

          <Form.Item
            name="personne2"
            label={<span><UserOutlined /> Personne 2</span>}
            rules={[{ required: true, message: 'Sélectionnez une personne' }]}
            className="person-select-item"
          >
            <Select
              showSearch
              placeholder="Rechercher une personne..."
              optionFilterProp="children"
              filterOption={filterOption}
              size="large"
              suffixIcon={<UserOutlined />}
            >
              {personnesTriees.map(p => (
                <Option key={p._id} value={p._id} label={`${p.prenom} ${p.nom}`}>
                  <Space>
                    {p.genre === 'homme' ? <ManOutlined style={{ color: '#3b82f6' }} /> : 
                     p.genre === 'femme' ? <WomanOutlined style={{ color: '#ec4899' }} /> : 
                     <UserOutlined />}
                    {p.prenom} {p.nom}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Divider className="form-divider">
          <Tag color="default">Optionnel</Tag>
        </Divider>

        {/* Date et détails */}
        <div className="optional-fields">
          <Form.Item
            name="dateDebut"
            label={<span><CalendarOutlined /> Date</span>}
            className="date-field"
          >
            <DatePicker
              placeholder="Date de début de la relation"
              format="DD/MM/YYYY"
              size="large"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="details"
            label={<span><FileTextOutlined /> Notes</span>}
            className="details-field"
          >
            <TextArea
              placeholder="Informations complémentaires (lieu du mariage, circonstances...)"
              rows={2}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </div>

        {/* Bouton de soumission */}
        <Form.Item className="submit-section">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<HeartOutlined />}
            size="large"
            block
            className="submit-relation-btn"
          >
            Créer la relation
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RelationForm;
