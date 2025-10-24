import React from 'react'

const Stats = () => {
  const stats = [
    { value: "$250K", label: "Traded in tokens" },
    { value: "88", label: "Content Creators" },
    { value: "80+", label: "ICOs launched" },
    { value: "5658+", label: "Investors" },
  ];

  return (
    <div className='w-full h-fit px-10 xl:px-40 my-20 lg:my-40'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-0'>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`flex flex-col justify-center items-center ${index < stats.length - 1 ? 'md:border-r' : ''} border-zinc-500`}
            >
              <div className='text-4xl lg:text-5xl xl:text-6xl font-cabinet-bold mb-3'>
                {stat.value}
              </div>
              <div className='text-sm lg:text-base font-cabinet-medium text-gray-600'>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}

export default Stats