import useEmblaCarousel from 'embla-carousel-react';
import { useEffect } from 'react';

export interface BillItem {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // human-readable
  iconUrl?: string;
}

interface BillsDueCarouselProps {
  items: BillItem[];
}

export const BillsDueCarousel = ({ items }: BillsDueCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: true, align: 'start' });

  useEffect(() => {
    if (!emblaApi) return;
  }, [emblaApi]);

  const format = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-3">
        {items.map((b) => (
          <div key={b.id} className="min-w-[220px] bg-white border border-gray-200 rounded-2xl p-4 mobile-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {b.iconUrl ? (
                  <img src={b.iconUrl} alt={b.name} className="w-8 h-8" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100" />
                )}
                <div>
                  <div className="text-sm font-semibold text-gray-900">{b.name}</div>
                  <div className="text-xs text-gray-500">{b.dueDate}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-900">{format(b.amount)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillsDueCarousel;
