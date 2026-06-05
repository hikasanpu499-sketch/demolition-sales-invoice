import { howToUseContent } from '@/lib/how-to-use-content';

export default function HowToUsePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{howToUseContent.title}</h1>
      <div className="space-y-8">
        {howToUseContent.sections.map((section, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">{section.title}</h2>
            <p className="text-gray-600 mb-4">{section.content}</p>
            {section.steps.length > 0 && (
              <ol className="space-y-2">
                {section.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{j + 1}</span>
                    <span className="text-gray-700 text-sm pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
