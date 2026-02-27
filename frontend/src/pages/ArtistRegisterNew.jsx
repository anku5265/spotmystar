import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/api';
import Toast from '../components/Toast';

export default function ArtistRegisterNew() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [primaryCategory, setPrimaryCategory] = useState('');
  const [categoryAttributes, setCategoryAttributes] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [serviceLocationInput, setServiceLocationInput] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    stageName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    shortBio: '',
    detailedDescription: '',
    primaryCity: '',
    serviceLocations: [],
    yearsOfExperience: '',
    pricingModel: 'per_event',
    priceMin: '',
    priceMax: '',
    instagram: '',
    youtube: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    website: '',
    dynamicAttributes: {},
    termsAccepted: false,
    privacyAccepted: false
  });

  const totalSteps = 6;
  const stepTitles = [
    'Account Creation',
    'Select Categories',
    'Profile Details',
    'Pricing & Availability',
    'Social Links & Portfolio',
    'Review & Submit'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch attributes when categories are selected
    selectedCategories.forEach(catId => {
      if (!categoryAttributes[catId]) {
        fetchCategoryAttributes(catId);
      }
    });
  }, [selectedCategories]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/categories?grouped=true');
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setToast({ message: 'Failed to load categories', type: 'error' });
    }
  };

  const fetchCategoryAttributes = async (categoryId) => {
    try {
      const { data } = await api.get(`/api/categories/${categoryId}/attributes`);
      setCategoryAttributes(prev => ({ ...prev, [categoryId]: data }));
    } catch (error) {
      console.error('Error loading category attributes:', error);
    }
  };

  const handleCategorySelect = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
      if (primaryCategory === categoryId) {
        setPrimaryCategory(selectedCategories.find(id => id !== categoryId) || '');
      }
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
      if (!primaryCategory) {
        setPrimaryCategory(categoryId);
      }
    }
  };

  const addServiceLocation = () => {
    if (serviceLocationInput.trim() && !formData.serviceLocations.includes(serviceLocationInput.trim())) {
      setFormData({
        ...formData,
        serviceLocations: [...formData.serviceLocations, serviceLocationInput.trim()]
      });
      setServiceLocationInput('');
    }
  };

  const removeServiceLocation = (location) => {
    setFormData({
      ...formData,
      serviceLocations: formData.serviceLocations.filter(loc => loc !== location)
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.fullName || !formData.stageName || !formData.email || !formData.phone || !formData.password) {
        setToast({ message: 'Please fill all required fields', type: 'error' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setToast({ message: 'Passwords do not match', type: 'error' });
        return;
      }
      if (formData.password.length < 6) {
        setToast({ message: 'Password must be at least 6 characters', type: 'error' });
        return;
      }
    }
    
    if (currentStep === 2) {
      if (selectedCategories.length === 0) {
        setToast({ message: 'Please select at least one category', type: 'error' });
        return;
      }
      if (!primaryCategory) {
        setToast({ message: 'Please select a primary category', type: 'error' });
        return;
      }
    }
    
    if (currentStep === 3) {
      if (!formData.primaryCity) {
        setToast({ message: 'Please enter your primary city', type: 'error' });
        return;
      }
      if (!formData.shortBio) {
        setToast({ message: 'Please enter a short bio', type: 'error' });
        return;
      }
    }
    
    if (currentStep === 4) {
      if (!formData.priceMin || !formData.priceMax) {
        setToast({ message: 'Please enter your pricing range', type: 'error' });
        return;
      }
      if (parseInt(formData.priceMin) > parseInt(formData.priceMax)) {
        setToast({ message: 'Minimum price cannot be greater than maximum price', type: 'error' });
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!formData.termsAccepted || !formData.privacyAccepted) {
      setToast({ message: 'Please accept terms and privacy policy', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        stageName: formData.stageName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        categories: selectedCategories,
        primaryCategory: primaryCategory,
        shortBio: formData.shortBio,
        detailedDescription: formData.detailedDescription,
        primaryCity: formData.primaryCity,
        serviceLocations: formData.serviceLocations,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
        pricingModel: formData.pricingModel,
        priceMin: parseInt(formData.priceMin),
        priceMax: parseInt(formData.priceMax),
        instagram: formData.instagram,
        youtube: formData.youtube,
        facebook: formData.facebook,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        website: formData.website,
        dynamicAttributes: formData.dynamicAttributes,
        termsAccepted: formData.termsAccepted,
        privacyAccepted: formData.privacyAccepted
      };

      const { data } = await api.post('/api/artists/register', payload);
      
      localStorage.setItem('artistToken', data.token);
      localStorage.setItem('artistData', JSON.stringify(data.artist));
      
      window.dispatchEvent(new Event('userLogin'));
      
      setToast({ message: 'Registration successful! Your profile is under review.', type: 'success' });
      setTimeout(() => navigate('/artist/dashboard'), 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setToast({ message: error.response?.data?.message || 'Registration failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === currentStep ? 'border-primary bg-primary text-white' :
              step < currentStep ? 'border-green-500 bg-green-500 text-white' :
              'border-gray-600 bg-gray-800 text-gray-400'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
            {step < totalSteps && (
              <div className={`flex-1 h-1 mx-2 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-xl font-bold">{stepTitles[currentStep - 1]}</h3>
        <p className="text-gray-400 text-sm">Step {currentStep} of {totalSteps}</p>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Full Name *"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Stage/Brand Name *"
          required
          value={formData.stageName}
          onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
          className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <input
        type="email"
        placeholder="Email *"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
      />

      <input
        type="tel"
        placeholder="Phone Number (OTP Verified) *"
        required
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password *"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full bg-white/5 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      <input
        type="password"
        placeholder="Confirm Password *"
        required
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {Object.entries(categories).map(([groupKey, groupCategories]) => {
        if (!groupCategories || groupCategories.length === 0) return null;
        
        const groupTitles = {
          performing_artists: 'A. Performing Artists',
          creative_professionals: 'B. Creative Professionals',
          influencers_creators: 'C. Influencers & Digital Creators'
        };

        return (
          <div key={groupKey} className="bg-white/5 rounded-lg p-4">
            <h4 className="font-bold text-lg mb-3 text-primary">{groupTitles[groupKey]}</h4>
            <div className="grid md:grid-cols-3 gap-3">
              {groupCategories.map(cat => (
                <label
                  key={cat.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => handleCategorySelect(cat.id)}
                    className="w-5 h-5"
                  />
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium block">{cat.name}</span>
                    {selectedCategories.includes(cat.id) && primaryCategory === cat.id && (
                      <span className="text-xs text-primary">Primary</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      })}

      {selectedCategories.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <h4 className="font-bold mb-2 text-yellow-200">📌 Select Your Primary Category</h4>
          <p className="text-sm text-gray-400 mb-3">Choose one category as your main specialization (this will be highlighted on your profile)</p>
          <div className="space-y-2">
            {selectedCategories.map(catId => {
              const cat = Object.values(categories).flat().find(c => c.id === catId);
              if (!cat) return null;
              
              return (
                <label
                  key={cat.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition ${
                    primaryCategory === cat.id
                      ? 'bg-primary/30 border-2 border-primary'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="primaryCategory"
                    value={cat.id}
                    checked={primaryCategory === cat.id}
                    onChange={(e) => setPrimaryCategory(e.target.value)}
                    className="w-5 h-5 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-medium flex-1">{cat.name}</span>
                  {primaryCategory === cat.id && (
                    <span className="px-3 py-1 bg-primary rounded-full text-sm font-semibold">Primary ⭐</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <textarea
        placeholder="Short Bio (200 characters max) *"
        maxLength="200"
        rows="3"
        value={formData.shortBio}
        onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
        className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
      />

      <textarea
        placeholder="Detailed Description"
        rows="5"
        value={formData.detailedDescription}
        onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
        className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
      />

      <input
        type="text"
        placeholder="Primary City *"
        required
        value={formData.primaryCity}
        onChange={(e) => setFormData({ ...formData, primaryCity: e.target.value })}
        className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
      />

      <div>
        <label className="block text-sm mb-2">Service Locations (Cities you serve)</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Add city"
            value={serviceLocationInput}
            onChange={(e) => setServiceLocationInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceLocation())}
            className="flex-1 bg-white/5 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={addServiceLocation}
            className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/80"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.serviceLocations.map((loc, idx) => (
            <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-2">
              {loc}
              <button
                type="button"
                onClick={() => removeServiceLocation(loc)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <input
        type="number"
        placeholder="Years of Experience"
        value={formData.yearsOfExperience}
        onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
        className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Dynamic Category Attributes */}
      {selectedCategories.map(catId => {
        const attrs = categoryAttributes[catId] || [];
        if (attrs.length === 0) return null;

        const cat = Object.values(categories).flat().find(c => c.id === catId);
        
        return (
          <div key={catId} className="bg-white/5 rounded-lg p-4 space-y-3">
            <h4 className="font-bold text-primary">{cat?.name} Specific Fields</h4>
            {attrs.map(attr => (
              <div key={attr.id}>
                <label className="block text-sm mb-1">
                  {attr.attribute_label} {attr.is_required && '*'}
                </label>
                {attr.attribute_type === 'select' && (
                  <select
                    required={attr.is_required}
                    value={formData.dynamicAttributes[attr.id] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      dynamicAttributes: { ...formData.dynamicAttributes, [attr.id]: e.target.value }
                    })}
                    className="w-full bg-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select {attr.attribute_label}</option>
                    {attr.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {attr.attribute_type === 'multiselect' && (
                  <select
                    multiple
                    required={attr.is_required}
                    value={formData.dynamicAttributes[attr.id] || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({
                        ...formData,
                        dynamicAttributes: { ...formData.dynamicAttributes, [attr.id]: selected }
                      });
                    }}
                    className="w-full bg-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                    size="4"
                  >
                    {attr.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {(attr.attribute_type === 'text' || attr.attribute_type === 'url' || attr.attribute_type === 'email') && (
                  <input
                    type={attr.attribute_type}
                    required={attr.is_required}
                    placeholder={attr.placeholder}
                    value={formData.dynamicAttributes[attr.id] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      dynamicAttributes: { ...formData.dynamicAttributes, [attr.id]: e.target.value }
                    })}
                    className="w-full bg-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
                {attr.attribute_type === 'number' && (
                  <input
                    type="number"
                    required={attr.is_required}
                    placeholder={attr.placeholder}
                    value={formData.dynamicAttributes[attr.id] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      dynamicAttributes: { ...formData.dynamicAttributes, [attr.id]: e.target.value }
                    })}
                    className="w-full bg-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
                {attr.attribute_type === 'textarea' && (
                  <textarea
                    required={attr.is_required}
                    placeholder={attr.placeholder}
                    rows="3"
                    value={formData.dynamicAttributes[attr.id] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      dynamicAttributes: { ...formData.dynamicAttributes, [attr.id]: e.target.value }
                    })}
                    className="w-full bg-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
                {attr.help_text && (
                  <p className="text-xs text-gray-400 mt-1">{attr.help_text}</p>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-2">Pricing Model</label>
        <select
          value={formData.pricingModel}
          onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
          className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="per_event">Per Event</option>
          <option value="per_hour">Per Hour</option>
          <option value="per_day">Per Day</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-2">Minimum Price (₹) *</label>
          <input
            type="number"
            placeholder="e.g., 5000"
            required
            value={formData.priceMin}
            onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
            className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm mb-2">Maximum Price (₹) *</label>
          <input
            type="number"
            placeholder="e.g., 50000"
            required
            value={formData.priceMax}
            onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
            className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <p className="text-sm text-gray-400">
          💡 Tip: Set a realistic price range based on your experience and market rates. 
          You can always adjust this later from your dashboard.
        </p>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <h4 className="font-bold text-lg mb-3">Social Media Links</h4>
      
      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Instagram Username"
          value={formData.instagram}
          onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
          className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="YouTube Channel"
          value={formData.youtube}
          onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
          className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Facebook Profile"
          value={formData.facebook}
          onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
          className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Twitter Handle"
          value={formData.twitter}
          onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
          className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="LinkedIn Profile"
          value={formData.linkedin}
          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
          className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="url"
          placeholder="Website URL"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-white/5 rounded-lg p-4 mt-6">
        <p className="text-sm text-gray-400">
          📸 Portfolio Upload: You can upload your portfolio images and videos after registration from your dashboard.
        </p>
      </div>
    </div>
  );

  const renderStep6 = () => {
    const selectedCats = selectedCategories.map(catId => 
      Object.values(categories).flat().find(c => c.id === catId)
    ).filter(Boolean);

    return (
      <div className="space-y-6">
        <div className="bg-white/5 rounded-lg p-6">
          <h4 className="font-bold text-lg mb-4">Review Your Information</h4>
          
          <div className="space-y-3 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Full Name</p>
                <p className="font-semibold">{formData.fullName}</p>
              </div>
              <div>
                <p className="text-gray-400">Stage Name</p>
                <p className="font-semibold">{formData.stageName}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="font-semibold">{formData.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Phone</p>
                <p className="font-semibold">{formData.phone}</p>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-3 mt-3">
              <p className="text-gray-400 mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {selectedCats.map(cat => (
                  <span key={cat.id} className={`px-3 py-1 rounded-full text-sm ${
                    cat.id === primaryCategory ? 'bg-primary' : 'bg-white/10'
                  }`}>
                    {cat.icon} {cat.name} {cat.id === primaryCategory && '(Primary)'}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-3 mt-3">
              <p className="text-gray-400">Primary City</p>
              <p className="font-semibold">{formData.primaryCity}</p>
            </div>

            <div className="border-t border-gray-700 pt-3 mt-3">
              <p className="text-gray-400">Pricing</p>
              <p className="font-semibold">₹{formData.priceMin} - ₹{formData.priceMax} ({formData.pricingModel.replace('_', ' ')})</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
              className="w-5 h-5 mt-1"
            />
            <span className="text-sm">
              I accept the <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.privacyAccepted}
              onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
              className="w-5 h-5 mt-1"
            />
            <span className="text-sm">
              I accept the <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </span>
          </label>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-sm text-yellow-200">
            ⚠️ Your profile will be reviewed by our admin team. You'll receive a notification once approved.
            Status Flow: Submitted → Pending Review → Approved → Live
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.svg" alt="SpotMyStar" className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold">Join as Artist/Creator</h1>
            <p className="text-gray-400">Complete your profile to start receiving bookings</p>
          </div>
        </div>

        {renderStepIndicator()}

        <form onSubmit={(e) => e.preventDefault()} className="mt-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
              >
                Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-6 py-3 btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="ml-auto px-6 py-3 btn-primary disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/artist/login" className="text-secondary hover:underline font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
