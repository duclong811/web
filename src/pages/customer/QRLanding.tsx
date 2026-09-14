import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Coffee, CheckCircle2, Loader2 } from 'lucide-react';

export default function QRLanding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const { initGuestSession, fetchMenu } = useStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processQRCode = async () => {
      try {
        // Extract from URL: /qr?store=1&table=5 or /table/1/5
        let storeId: number;
        let tableId: string;

        if (params.storeId && params.tableId) {
          // Path params: /table/:storeId/:tableId
          storeId = parseInt(params.storeId);
          tableId = params.tableId;
        } else {
          // Query params: /qr?store=1&table=5
          const storeParam = searchParams.get('store');
          const tableParam = searchParams.get('table');

          if (!storeParam || !tableParam) {
            setError('Mã QR không hợp lệ. Vui lòng quét lại mã QR tại bàn.');
            setIsProcessing(false);
            return;
          }

          storeId = parseInt(storeParam);
          tableId = tableParam;
        }

        if (isNaN(storeId)) {
          setError('Mã quán không hợp lệ.');
          setIsProcessing(false);
          return;
        }

        // Initialize guest session
        initGuestSession(storeId, tableId);

        // Fetch menu for this store
        await fetchMenu(storeId);

        // Success animation then redirect
        setTimeout(() => {
          navigate('/menu');
        }, 1500);
      } catch (err) {
        console.error('QR processing error:', err);
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
        setIsProcessing(false);
      }
    };

    processQRCode();
  }, [searchParams, params, initGuestSession, fetchMenu, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '3rem 2rem',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
        }}>
          {isProcessing ? (
            <Loader2 size={40} color="white" className="animate-spin" />
          ) : error ? (
            <Coffee size={40} color="white" />
          ) : (
            <CheckCircle2 size={40} color="white" />
          )}
        </div>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: 'var(--text-primary)',
          marginBottom: '0.75rem',
        }}>
          {isProcessing ? 'Đang kết nối...' : error ? 'Oops!' : 'Thành công!'}
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          marginBottom: '2rem',
        }}>
          {isProcessing ? (
            <>Vui lòng đợi trong giây lát<br />Chúng tôi đang chuẩn bị thực đơn cho bạn...</>
          ) : error ? (
            error
          ) : (
            <>Bạn đã được kết nối!<br />Đang chuyển đến thực đơn...</>
          )}
        </p>

        {error && (
          <button
            onClick={() => navigate('/menu')}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '12px',
            }}
          >
            Xem Thực Đơn
          </button>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
