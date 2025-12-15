import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Notifications,
  LocalShipping,
  LocalOffer,
  Info,
  Delete,
  Circle,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const NotificationsPage = () => {
  const { user, login } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  // Mock bildirimler
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Siparişiniz Kargoya Verildi',
      message: '#12345 numaralı siparişiniz kargoya verildi.',
      date: '2 saat önce',
      read: false,
    },
    {
      id: 2,
      type: 'campaign',
      title: 'Yeni Kampanya!',
      message: 'Gaming laptop\'larda %20\'ye varan indirim!',
      date: '1 gün önce',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'Hesap Güvenliği',
      message: 'Hesabınıza yeni bir cihazdan giriş yapıldı.',
      date: '3 gün önce',
      read: true,
    },
  ];

  if (!user) {
    login();
    return null;
  }

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <LocalShipping color="primary" />;
      case 'campaign': return <LocalOffer color="secondary" />;
      case 'info': return <Info color="info" />;
      default: return <Notifications />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Bildirimler
        </Typography>
        {unreadCount > 0 && (
          <Chip label={`${unreadCount} okunmamış`} color="primary" size="small" />
        )}
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="Tümü" />
        <Tab label="Siparişler" />
        <Tab label="Kampanyalar" />
      </Tabs>

      {notifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Notifications sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Henüz bildiriminiz yok
          </Typography>
        </Box>
      ) : (
        <List>
          {notifications
            .filter(n => {
              if (tabValue === 0) return true;
              if (tabValue === 1) return n.type === 'order';
              if (tabValue === 2) return n.type === 'campaign';
              return true;
            })
            .map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'rgba(0, 212, 255, 0.05)',
                  borderRadius: 1,
                  mb: 1,
                  border: '1px solid',
                  borderColor: notification.read ? 'transparent' : 'primary.main',
                }}
                secondaryAction={
                  <IconButton edge="end">
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemIcon>{getIcon(notification.type)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {!notification.read && (
                        <Circle sx={{ fontSize: 8, color: 'primary.main' }} />
                      )}
                      <Typography variant="subtitle2" fontWeight="bold">
                        {notification.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.date}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
        </List>
      )}
    </Container>
  );
};

export default NotificationsPage;
