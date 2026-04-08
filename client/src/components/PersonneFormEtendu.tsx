import React, { useState } from 'react';
import { Form, Input, DatePicker, Select, Button, Tabs, Space, Upload, message, Tag } from 'antd';
import {
  UserOutlined,
  EnvironmentOutlined,
  BookOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  TeamOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { TabPane } = Tabs;

interface PersonneFormProps {
  onSubmit: (values: any) => void;
  initialValues?: any;
  isEditing?: boolean;
}

const PersonneFormEtendu: React.FC<PersonneFormProps> = ({ onSubmit, initialValues, isEditing = false }) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [photo, setPhoto] = useState<string | null>(initialValues?.photo || null);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePhotoChange = async (file: File) => {
    const base64 = await getBase64(file);
    setPhoto(base64);
    setPhotoRemoved(false);
    return false;
  };

  const handlePhotoRemove = () => {
    setPhoto(null);
    setPhotoRemoved(true);
  };

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      photo: photoRemoved ? null : (photo || initialValues?.photo || null),
      dateNaissance: values.dateNaissance?.format('YYYY-MM-DD'),
      dateDeces: values.dateDeces?.format('YYYY-MM-DD'),
    };
    onSubmit(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues ? {
        ...initialValues,
        dateNaissance: initialValues.dateNaissance ? dayjs(initialValues.dateNaissance) : null,
        dateDeces: initialValues.dateDeces ? dayjs(initialValues.dateDeces) : null,
      } : {}}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* Onglet 1 : Informations de base */}
        <TabPane tab={<span><UserOutlined /> Identité</span>} key="1">
          <Form.Item
            label="Photo de profil"
            name="photo"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={handlePhotoChange}
              onRemove={handlePhotoRemove}
              fileList={photo ? [{
                uid: '-1',
                name: 'photo',
                status: 'done',
                url: photo,
              }] : []}
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            >
              {!photo && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Ajouter une photo</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label="Nom"
            name="nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Nom de famille" />
          </Form.Item>

          <Form.Item
            label="Prénom"
            name="prenom"
            rules={[{ required: true, message: 'Le prénom est requis' }]}
          >
            <Input placeholder="Prénom" />
          </Form.Item>

          <Form.Item label="Nom de jeune fille" name="nomJeuneFille">
            <Input placeholder="Nom avant mariage" />
          </Form.Item>

          <Form.Item label="Surnoms" name="surnoms">
            <Select mode="tags" placeholder="Ajouter des surnoms"></Select>
          </Form.Item>

          <Form.Item
            label="Genre"
            name="genre"
            rules={[{ required: true, message: 'Le genre est requis' }]}
          >
            <Select placeholder="Sélectionner le genre">
              <Select.Option value="homme">Homme</Select.Option>
              <Select.Option value="femme">Femme</Select.Option>
              <Select.Option value="autre">Autre</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Date de naissance"
            name="dateNaissance"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Lieu de naissance" name="lieuNaissance">
            <Input placeholder="Ville, Pays" />
          </Form.Item>

          <Form.Item label="Date de décès" name="dateDeces">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Lieu de décès" name="lieuDeces">
            <Input placeholder="Ville, Pays" />
          </Form.Item>

          <Form.Item label="Cause du décès" name="causeDeces">
            <Input placeholder="Cause (optionnel)" />
          </Form.Item>

          <Form.Item label="Nationalité" name="nationalite">
            <Input placeholder="Nationalité" />
          </Form.Item>

          <Form.Item label="Religion" name="religion">
            <Input placeholder="Religion (optionnel)" />
          </Form.Item>

          <div style={{ marginTop: 16, marginBottom: 8, color: '#6366f1', fontWeight: 500 }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            Parents hors famille (si non présents dans l'arbre)
          </div>

          <Form.Item label="Nom du père (externe)" name="pereExterne">
            <Input placeholder="Prénom et Nom du père s'il n'est pas dans l'arbre" />
          </Form.Item>

          <Form.Item label="Nom de la mère (externe)" name="mereExterne">
            <Input placeholder="Prénom et Nom de la mère si elle n'est pas dans l'arbre" />
          </Form.Item>
        </TabPane>

        {/* Onglet 2 : Vie professionnelle */}
        <TabPane tab={<span><BookOutlined /> Profession</span>} key="2">
          <Form.Item label="Profession principale" name="profession">
            <Input placeholder="Titre du poste principal" />
          </Form.Item>

          <Form.Item label="Niveau d'études" name="niveauEtudes">
            <Select placeholder="Sélectionner le niveau">
              <Select.Option value="primaire">Primaire</Select.Option>
              <Select.Option value="secondaire">Secondaire</Select.Option>
              <Select.Option value="bac">Baccalauréat</Select.Option>
              <Select.Option value="licence">Licence</Select.Option>
              <Select.Option value="master">Master</Select.Option>
              <Select.Option value="doctorat">Doctorat</Select.Option>
              <Select.Option value="autre">Autre</Select.Option>
            </Select>
          </Form.Item>

          <Form.List name="etablissementsEtudes">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'nom']}
                      rules={[{ required: true, message: 'Nom requis' }]}
                    >
                      <Input placeholder="Établissement" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'diplome']}>
                      <Input placeholder="Diplôme" />
                    </Form.Item>
                    <DeleteOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Ajouter un établissement
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.List name="professions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'intitule']}
                      rules={[{ required: true, message: 'Intitulé requis' }]}
                    >
                      <Input placeholder="Intitulé du poste" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'lieu']}>
                      <Input placeholder="Lieu" />
                    </Form.Item>
                    <DeleteOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Ajouter une profession
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </TabPane>

        {/* Onglet 3 : Adresses */}
        <TabPane tab={<span><EnvironmentOutlined /> Adresses</span>} key="3">
          <Form.List name="adresses">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    style={{
                      border: '1px solid #d9d9d9',
                      padding: 16,
                      borderRadius: 8,
                      marginBottom: 16
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'adresse']}
                      label="Adresse"
                      rules={[{ required: true, message: 'Adresse requise' }]}
                    >
                      <Input placeholder="Numéro et rue" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'ville']}
                      label="Ville"
                      rules={[{ required: true, message: 'Ville requise' }]}
                    >
                      <Input placeholder="Ville" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'pays']}
                      label="Pays"
                      rules={[{ required: true, message: 'Pays requis' }]}
                    >
                      <Input placeholder="Pays" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'codePostal']} label="Code postal">
                      <Input placeholder="Code postal" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'type']} label="Type">
                      <Select placeholder="Type d'adresse">
                        <Select.Option value="residence">Résidence</Select.Option>
                        <Select.Option value="travail">Travail</Select.Option>
                        <Select.Option value="naissance">Naissance</Select.Option>
                        <Select.Option value="deces">Décès</Select.Option>
                      </Select>
                    </Form.Item>
                    <Button type="link" danger onClick={() => remove(name)} icon={<DeleteOutlined />}>
                      Supprimer
                    </Button>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Ajouter une adresse
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </TabPane>

        {/* Onglet 4 : Biographie */}
        <TabPane tab={<span><FileTextOutlined /> Biographie</span>} key="4">
          <Form.Item label="Biographie" name="biographie">
            <TextArea
              rows={8}
              placeholder="Écrivez l'histoire de vie de cette personne..."
              showCount
              maxLength={5000}
            />
          </Form.Item>

          <Form.Item label="Notes personnelles" name="notes">
            <TextArea
              rows={4}
              placeholder="Notes privées, anecdotes, souvenirs..."
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <Form.Item label="Contact - Email" name={['contacts', 'email']}>
            <Input type="email" placeholder="email@exemple.com" />
          </Form.Item>

          <Form.Item label="Contact - Téléphone" name={['contacts', 'telephone']}>
            <Input placeholder="+33 6 12 34 56 78" />
          </Form.Item>
        </TabPane>
      </Tabs>

      <Form.Item style={{ marginTop: 24 }}>
        <Space>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
            {isEditing ? 'Enregistrer' : 'Ajouter'}
          </Button>
          <Button onClick={() => form.resetFields()}>
            Réinitialiser
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default PersonneFormEtendu;
