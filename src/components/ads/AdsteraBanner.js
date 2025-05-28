// src/components/ads/AdsteraBanner.js
import { createAdComponent } from './AdBaseComponent';

const AdsteraBanner = createAdComponent({
  scriptSrc: '//www.highperformanceformat.com/3b30bfdb8bc7e8f2f9b936cc052dcc78/invoke.js',
  componentName: 'Banner',
  scriptOptions: {
    attrs: {
      'data-key': '3b30bfdb8bc7e8f2f9b936cc052dcc78',
      'data-format': 'iframe',
      'data-height': '60',
      'data-width': '468'
    }
  },
  renderContent: () => (
    <>
      <script 
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
            var atOptions = {
              'key': '3b30bfdb8bc7e8f2f9b936cc052dcc78',
              'format': 'iframe',
              'height': 60,
              'width': 468,
              'params': {}
            };
          `
        }}
      />
      <div id="adstera-banner-container">
        <script 
          type="text/javascript" 
          src="//www.highperformanceformat.com/3b30bfdb8bc7e8f2f9b936cc052dcc78/invoke.js"
        />
      </div>
    </>
  )
});

export default AdsteraBanner;