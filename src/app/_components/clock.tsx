import React from 'react';

const ClockDisplay = ({ currentDate }: { currentDate: Date }) => {
  return (
    <div className='absolute mt-2 flex gap-1 font-bold'>
      <div className='mt-9 h-14 w-14 rounded-lg bg-black text-center text-[40px] text-white'>
        {currentDate.getHours().toString().padStart(2, '0')[0]}
      </div>
      <div className='mt-9 h-14 w-14 rounded-lg bg-black text-center text-[40px] text-white'>
        {currentDate.getHours().toString().padStart(2, '0')[1]}
      </div>
      <div className='h-14 w-7 rounded-lg text-center text-[80px] text-black'>
        :
      </div>
      <div className='mt-9 h-14 w-14 rounded-lg bg-black text-center text-[40px] text-white'>
        {currentDate.getMinutes().toString().padStart(2, '0')[0]}
      </div>
      <div className='mt-9 h-14 w-14 rounded-lg bg-black text-center text-[40px] text-white'>
        {currentDate.getMinutes().toString().padStart(2, '0')[1]}
      </div>
    </div>
  );
};

export default ClockDisplay;
