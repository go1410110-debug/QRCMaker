import { DataInputSection } from './sections/DataInputSection'
import { CenterOverlaySection } from './sections/CenterOverlaySection'
import { DesignSection } from './sections/DesignSection'
import { TemplatesSection } from './sections/TemplatesSection'
import { ExportSection } from './sections/ExportSection'
import { BatchSection } from './sections/BatchSection'
import { AccordionSection } from './ui/AccordionSection'
import { useQRStore } from '../store/qrStore'
import { Database, Crosshair, Palette, Save, Download, Layers } from 'lucide-react'

export function Sidebar() {
  const { openSections, toggleSection } = useQRStore();

  const sections = [
    { key: 'data', title: 'Data Input', icon: Database, component: DataInputSection },
    { key: 'center', title: 'Center Overlay', icon: Crosshair, component: CenterOverlaySection },
    { key: 'design', title: 'Design & Colors', icon: Palette, component: DesignSection },
    { key: 'templates', title: 'Local Templates', icon: Save, component: TemplatesSection },
    { key: 'export', title: 'Export & Quality', icon: Download, component: ExportSection },
    { key: 'batch', title: 'Batch Generation', icon: Layers, component: BatchSection },
  ];

  return (
    <div className="p-4 space-y-2">
      {sections.map(({ key, title, icon: Icon, component: Component }) => (
        <AccordionSection
          key={key}
          title={title}
          icon={<Icon className="w-4 h-4" />}
          isOpen={openSections[key]}
          onToggle={() => toggleSection(key)}
        >
          <Component />
        </AccordionSection>
      ))}
    </div>
  );
}