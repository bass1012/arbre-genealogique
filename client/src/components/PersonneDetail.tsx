import React from 'react';
import { Card, Descriptions, Tag, Typography, Space, Divider, Timeline, Avatar, Empty } from 'antd';
import {
  UserOutlined,
  EnvironmentOutlined,
  BookOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  HeartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getImageUrl } from '../services/apiService';

const { Title, Paragraph, Text } = Typography;

interface PersonneDetailProps {
  personne: any;
}

const PersonneDetail: React.FC<PersonneDetailProps> = ({ personne }) => {
  const calculateAge = (dateNaissance: string, dateDeces?: string) => {
    const birthDate = dayjs(dateNaissance);
    const endDate = dateDeces ? dayjs(dateDeces) : dayjs();
    return endDate.diff(birthDate, 'year');
  };

  const age = calculateAge(personne.dateNaissance, personne.dateDeces);
  const isDeceased = !!personne.dateDeces;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* En-tête avec photo et nom */}
      <Card>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <Avatar
            size={150}
            src={getImageUrl(personne.photo)}
            icon={!personne.photo && <UserOutlined />}
            style={{ flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <Title level={2} style={{ margin: 0 }}>
              {personne.prenom} {personne.nom}
              {isDeceased && <span style={{ marginLeft: 12 }}>🕊️</span>}
            </Title>
            {personne.nomJeuneFille && (
              <Text type="secondary">Née {personne.nomJeuneFille}</Text>
            )}
            {personne.surnoms && personne.surnoms.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {personne.surnoms.map((surnom: string, index: number) => (
                  <Tag key={index} color="blue">{surnom}</Tag>
                ))}
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <Space direction="vertical" size="small">
                <Text>
                  <CalendarOutlined /> Né(e) le {dayjs(personne.dateNaissance).format('DD/MM/YYYY')}
                  {personne.lieuNaissance && ` à ${personne.lieuNaissance}`}
                </Text>
                {isDeceased && (
                  <Text>
                    <CalendarOutlined /> Décédé(e) le {dayjs(personne.dateDeces).format('DD/MM/YYYY')}
                    {personne.lieuDeces && ` à ${personne.lieuDeces}`}
                  </Text>
                )}
                <Text strong>{age} ans{!isDeceased && ' (en vie)'}</Text>
              </Space>
            </div>
          </div>
        </div>
      </Card>

      {/* Informations générales */}
      <Card title={<><UserOutlined /> Informations générales</>} style={{ marginTop: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Genre">{personne.genre || 'Non spécifié'}</Descriptions.Item>
          <Descriptions.Item label="Nationalité">{personne.nationalite || 'Non spécifiée'}</Descriptions.Item>
          <Descriptions.Item label="Religion">{personne.religion || 'Non spécifiée'}</Descriptions.Item>
          <Descriptions.Item label="Profession">{personne.profession || 'Non spécifiée'}</Descriptions.Item>
          {personne.pereExterne && (
            <Descriptions.Item label="Père (externe)">{personne.pereExterne}</Descriptions.Item>
          )}
          {personne.mereExterne && (
            <Descriptions.Item label="Mère (externe)">{personne.mereExterne}</Descriptions.Item>
          )}
          {personne.causeDeces && (
            <Descriptions.Item label="Cause du décès" span={2}>{personne.causeDeces}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Biographie */}
      {personne.biographie && (
        <Card title={<><FileTextOutlined /> Biographie</>} style={{ marginTop: 16 }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{personne.biographie}</Paragraph>
        </Card>
      )}

      {/* Notes personnelles */}
      {personne.notes && (
        <Card title="Notes personnelles" style={{ marginTop: 16 }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{personne.notes}</Paragraph>
        </Card>
      )}

      {/* Parcours professionnel */}
      {personne.professions && personne.professions.length > 0 && (
        <Card title={<><BookOutlined /> Parcours professionnel</>} style={{ marginTop: 16 }}>
          <Timeline>
            {personne.professions.map((prof: any, index: number) => (
              <Timeline.Item key={index}>
                <Text strong>{prof.intitule}</Text>
                {prof.lieu && <Text type="secondary"> - {prof.lieu}</Text>}
                <br />
                {prof.dateDebut && (
                  <Text type="secondary">
                    {dayjs(prof.dateDebut).format('YYYY')}
                    {prof.dateFin ? ` - ${dayjs(prof.dateFin).format('YYYY')}` : ' - Présent'}
                  </Text>
                )}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {/* Études */}
      {personne.etablissementsEtudes && personne.etablissementsEtudes.length > 0 && (
        <Card title={<><BookOutlined /> Parcours scolaire</>} style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Niveau d'études: {personne.niveauEtudes || 'Non spécifié'}</Text>
            <Timeline>
              {personne.etablissementsEtudes.map((etab: any, index: number) => (
                <Timeline.Item key={index}>
                  <Text strong>{etab.nom}</Text>
                  {etab.diplome && <Text> - {etab.diplome}</Text>}
                  <br />
                  {etab.dateDebut && (
                    <Text type="secondary">
                      {dayjs(etab.dateDebut).format('YYYY')}
                      {etab.dateFin && ` - ${dayjs(etab.dateFin).format('YYYY')}`}
                    </Text>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          </Space>
        </Card>
      )}

      {/* Adresses */}
      {personne.adresses && personne.adresses.length > 0 && (
        <Card title={<><EnvironmentOutlined /> Adresses</>} style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {personne.adresses.map((addr: any, index: number) => (
              <div key={index} style={{ padding: 12, background: '#fafafa', borderRadius: 8 }}>
                <Tag color={
                  addr.type === 'residence' ? 'blue' :
                  addr.type === 'travail' ? 'green' :
                  addr.type === 'naissance' ? 'gold' :
                  'red'
                }>
                  {addr.type}
                </Tag>
                <div style={{ marginTop: 8 }}>
                  <Text>{addr.adresse}</Text><br />
                  <Text>{addr.codePostal} {addr.ville}, {addr.pays}</Text>
                </div>
                {addr.dateDebut && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <br />
                    {dayjs(addr.dateDebut).format('YYYY')}
                    {addr.dateFin ? ` - ${dayjs(addr.dateFin).format('YYYY')}` : ' - Présent'}
                  </Text>
                )}
              </div>
            ))}
          </Space>
        </Card>
      )}

      {/* Contacts */}
      {personne.contacts && (personne.contacts.email || personne.contacts.telephone) && (
        <Card title="Contacts" style={{ marginTop: 16 }}>
          <Space direction="vertical">
            {personne.contacts.email && (
              <Text>
                <MailOutlined /> {personne.contacts.email}
              </Text>
            )}
            {personne.contacts.telephone && (
              <Text>
                <PhoneOutlined /> {personne.contacts.telephone}
              </Text>
            )}
          </Space>
        </Card>
      )}

      {/* Documents */}
      {personne.documents && personne.documents.length > 0 && (
        <Card title="Documents" style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {personne.documents.map((doc: any, index: number) => (
              <div key={index} style={{ padding: 12, background: '#fafafa', borderRadius: 8 }}>
                <Space>
                  <FileTextOutlined />
                  <div>
                    <Text strong>{doc.titre}</Text>
                    <br />
                    <Text type="secondary">{doc.type} - {dayjs(doc.date).format('DD/MM/YYYY')}</Text>
                    {doc.description && (
                      <>
                        <br />
                        <Text>{doc.description}</Text>
                      </>
                    )}
                  </div>
                </Space>
              </div>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default PersonneDetail;
