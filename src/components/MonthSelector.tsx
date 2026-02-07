import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMoneyLedger } from '../store/useStore';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function MonthSelector() {
    const { selectedDate, nextMonth, prevMonth, language } = useMoneyLedger();

    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[100px] text-center font-medium">
                {language === 'ko'
                    ? format(selectedDate, 'yyyy년 M월', { locale: ko })
                    : format(selectedDate, 'MMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
