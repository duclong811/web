import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Vui lòng nhập email';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Vui lòng nhập định dạng email hợp lệ';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Vui lòng nhập mật khẩu';
    }
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!/\d/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất một chữ số';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt';
    }
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
      return 'Vui lòng xác nhận mật khẩu';
    }
    if (confirmPassword !== password) {
      return 'Mật khẩu nhập lại không khớp';
    }
    return undefined;
  };

  const validateFullName = (fullName: string): string | undefined => {
    if (!fullName.trim()) {
      return 'Vui lòng nhập họ và tên';
    }
    if (fullName.trim().length < 2) {
      return 'Họ và tên phải có ít nhất 2 ký tự';
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return 'Vui lòng nhập số điện thoại';
    }
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0 hoặc +84)';
    }
    return undefined;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  // Handle field change
  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear server error when user starts typing
    if (serverError) {
      setServerError('');
    }

    // Clear field error when user starts typing
    if (touched[field]) {
      let fieldError: string | undefined;
      
      switch (field) {
        case 'fullName':
          fieldError = validateFullName(value);
          break;
        case 'email':
          fieldError = validateEmail(value);
          break;
        case 'phone':
          fieldError = validatePhone(value);
          break;
        case 'password':
          fieldError = validatePassword(value);
          // Also revalidate confirm password if it has been touched
          if (touched.confirmPassword) {
            setErrors(prev => ({
              ...prev,
              password: fieldError,
              confirmPassword: validateConfirmPassword(formData.confirmPassword, value),
            }));
            return;
          }
          break;
        case 'confirmPassword':
          fieldError = validateConfirmPassword(value, formData.password);
          break;
      }
      
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    }
  };

  // Handle field blur
  const handleBlur = (field: keyof typeof formData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let fieldError: string | undefined;
    
    switch (field) {
      case 'fullName':
        fieldError = validateFullName(formData.fullName);
        break;
      case 'email':
        fieldError = validateEmail(formData.email);
        break;
      case 'phone':
        fieldError = validatePhone(formData.phone);
        break;
      case 'password':
        fieldError = validatePassword(formData.password);
        break;
      case 'confirmPassword':
        fieldError = validateConfirmPassword(formData.confirmPassword, formData.password);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');

    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/register', {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\s/g, ''),
        password: formData.password,
      });

      setSuccess(response.data.message || 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      
      // Chuyển về login sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Register error:', err);
      
      // Handle specific error cases
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        // Try to get message from different possible locations
        const message = data?.message || data?.data?.message || data?.error;
        const errors = data?.errors; // Validation errors object from backend
        
        if (status === 400) {
          // Bad Request - validation errors
          if (errors && typeof errors === 'object') {
            // Backend trả về object errors: { "Email": ["error1", "error2"], "Password": ["error"] }
            const errorMessages: string[] = [];
            Object.keys(errors).forEach(field => {
              const fieldErrors = errors[field];
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach(msg => errorMessages.push(`• ${msg}`));
              } else if (typeof fieldErrors === 'string') {
                errorMessages.push(`• ${fieldErrors}`);
              }
            });
            
            if (errorMessages.length > 0) {
              setServerError('Vui lòng sửa các lỗi sau:\n\n' + errorMessages.join('\n'));
            } else {
              setServerError(message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.');
            }
          } else if (message) {
            setServerError(message);
          } else {
            setServerError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.');
          }
        } else if (status === 409) {
          // Conflict - duplicate data
          if (message && message.toLowerCase().includes('email')) {
            setServerError('❌ Email này đã được đăng ký.\n\nVui lòng sử dụng email khác hoặc đăng nhập nếu đây là tài khoản của bạn.');
          } else if (message && (message.toLowerCase().includes('username') || message.toLowerCase().includes('tên'))) {
            setServerError('❌ Tên người dùng đã được sử dụng.\n\nVui lòng chọn tên khác.');
          } else if (message && message.toLowerCase().includes('phone')) {
            setServerError('❌ Số điện thoại này đã được đăng ký.\n\nVui lòng sử dụng số khác.');
          } else {
            setServerError(message || 'Thông tin đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.');
          }
        } else if (status === 500) {
          setServerError('⚠️ Lỗi máy chủ. Vui lòng thử lại sau ít phút.');
        } else {
          setServerError(message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
        }
      } else if (err.code === 'ERR_NETWORK') {
        setServerError('🌐 Không thể kết nối đến máy chủ.\n\nVui lòng kiểm tra kết nối mạng của bạn.');
      } else {
        setServerError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">WC</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Đăng ký tài khoản</h1>
          <p className="text-gray-600 mt-2">Tạo tài khoản để đặt món nhanh hơn</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in duration-200">
            <p className="text-green-600 text-sm flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </p>
          </div>
        )}

        {/* Server Error Message */}
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="text-red-600 text-sm whitespace-pre-line flex-1">{serverError}</div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={handleChange('fullName')}
              onBlur={handleBlur('fullName')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition ${
                touched.fullName && errors.fullName
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
              placeholder="Nguyễn Văn A"
            />
            {touched.fullName && errors.fullName && (
              <p className="mt-1 text-sm text-red-500 flex items-center animate-in fade-in duration-200">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition ${
                touched.email && errors.email
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
              placeholder="example@gmail.com"
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-500 flex items-center animate-in fade-in duration-200">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              onBlur={handleBlur('phone')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition ${
                touched.phone && errors.phone
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
              placeholder="0901234567"
            />
            {touched.phone && errors.phone && (
              <p className="mt-1 text-sm text-red-500 flex items-center animate-in fade-in duration-200">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.phone}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition ${
                touched.password && errors.password
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
              placeholder="••••••••"
            />
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-red-500 flex items-center animate-in fade-in duration-200">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </p>
            )}
            {!errors.password && (
              <p className="mt-1 text-xs text-gray-500">
                Tối thiểu 8 ký tự, bao gồm chữ số và ký tự đặc biệt
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition ${
                touched.confirmPassword && errors.confirmPassword
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
              placeholder="••••••••"
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500 flex items-center animate-in fade-in duration-200">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : success ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Chuyển đến đăng nhập...
              </>
            ) : (
              'Đăng ký'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <a href="/login" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline transition">
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
