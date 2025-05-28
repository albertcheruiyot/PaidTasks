// src/components/ads/AdsteraPopunder.js
import { createAdComponent } from './AdBaseComponent';

const AdsteraPopunder = createAdComponent({
  scriptSrc: '//pl26712192.profitableratecpm.com/de/88/b3/de88b344a38d2fae2c6ba4f28f1cd79a.js',
  componentName: 'Popunder',
  renderContent: () => (
    <script 
      type='text/javascript' 
      src='//pl26712192.profitableratecpm.com/de/88/b3/de88b344a38d2fae2c6ba4f28f1cd79a.js'
    />
  )
});

export default AdsteraPopunder;