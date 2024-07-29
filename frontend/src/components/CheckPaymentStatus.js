import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const CheckPaymentStatus = ({ paymentId }) => {
  const { token } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState('PENDING');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5002/api/payments/check-payment-status/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaymentStatus(response.data.status);
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
      }
    };

    const intervalId = setInterval(checkPaymentStatus, 30000);

    const timeoutId = setTimeout(async () => {
      if (paymentStatus !== 'RECEIVED') {
        try {
          await axios.post('http://localhost:5002/api/tickets/cancel', { paymentId }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPaymentStatus('CANCELED');
        } catch (error) {
          console.error('Erro ao cancelar bilhetes:', error);
        }
      }
    }, 300000); // 5 minutos

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [paymentId, token, paymentStatus]);

  return <div>Status do pagamento: {paymentStatus}</div>;
};

export default CheckPaymentStatus;
