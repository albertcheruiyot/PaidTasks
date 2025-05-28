// src/components/ads/AdsteraNativeBanner.js
import { createAdComponent } from './AdBaseComponent';

const AdsteraNativeBanner = createAdComponent({
  scriptSrc: '//pl26712208.profitableratecpm.com/ec4046157e29756538cd462714d9ae42/invoke.js',
  componentName: 'NativeBanner',
  scriptOptions: {
    attrs: {
      'data-cfasync': 'false'
    }
  },
  renderContent: () => (
    <div 
      id="container-ec4046157e29756538cd462714d9ae42"
    >
      <script 
        async 
        data-cfasync="false" 
        src="//pl26712208.profitableratecpm.com/ec4046157e29756538cd462714d9ae42/invoke.js"
      />
    </div>
  )
});

export default AdsteraNativeBanner;