import dayjs from 'dayjs';

export const getDateRange = (type: 'daily' | 'monthly' | 'yearly', dateInput: string) => {
  const date = dayjs(dateInput);
  
  if (type === 'daily') {
    return {
      start: date.startOf('day').toDate(), 
      end: date.endOf('day').toDate(),     
      groupBy: "TO_CHAR(create_at + interval '7 hours', 'HH24:00')"
    };
  } else if (type === 'monthly') {
    return {
      start: date.startOf('month').toDate(), 
      end: date.endOf('month').toDate(),     
      groupBy: "TO_CHAR(create_at, 'DD')",   
    };
  } else {
    return {
      start: date.startOf('year').toDate(),  
      end: date.endOf('year').toDate(),      
      groupBy: "TO_CHAR(create_at, 'Mon')",  
    };
  }
};