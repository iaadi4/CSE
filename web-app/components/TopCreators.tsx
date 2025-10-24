import React from 'react'

const TopCreators = () => {
  // Array of creator logos - using MrBeast for now
  const creators = [
    { id: 1, name: "MrBeast", logo: "/images/creators/mrbeastlogo.png" },
    { id: 2, name: "CarryMinati", logo: "/images/creators/carryminati.png" },
    { id: 3, name: "Ashish Chanchlani", logo: "/images/creators/ashish.png" },
    { id: 4, name: "Pewdiepie", logo: "/images/creators/pewdiepie.png" },
    { id: 5, name: "Shroud", logo: "/images/creators/shroud.png" },
    { id: 6, name: "Scout", logo: "/images/creators/scout.png" },
  ];

  return (
    <div className='w-dvw h-fit my-20 px-10 xl:px-40'>
        <div className='w-full h-[180px] bg-[#F3F4F4] rounded-3xl flex flex-col md:flex-row md:items-center justify-center pt-7'>
            <div className='font-cabinet-medium text-center md:px-5 xl:text-lg h-fit mb-4'>Join World's Top Content Creators</div>
            <div id='scroll-parent' className='h-full relative w-full overflow-x-hidden md:pt-5'>
                {/* Left gradient shadow */}
                <div className='absolute left-0 top-0 w-20 lg:w-32 h-full bg-linear-to-r from-[#F3F4F4] to-transparent z-10 pointer-events-none'></div>
                
                {/* Right gradient shadow */}
                <div className='absolute rounded-r-3xl right-0 top-0 w-20 lg:w-32 h-full bg-linear-to-l from-[#F3F4F4] to-transparent z-10 pointer-events-none'></div>
                
                {/* Scrolling container with duplicated content for seamless loop */}
                <div className='flex items-center gap-4 lg:gap-12 xl:gap-16 scroll-animate absolute'>
                  {/* First set of logos */}
                  {creators.map((creator) => (
                    <div
                      key={`first-${creator.id}`}
                      className='shrink-0 w-32 h-20 flex items-center justify-center'
                    >
                      <img 
                        src={creator.logo} 
                        alt={creator.name}
                        className='w-24 h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300'
                      />
                    </div>
                  ))}
                  {/* Second set for seamless infinite scroll */}
                  {creators.map((creator) => (
                    <div
                      key={`second-${creator.id}`}
                      className='shrink-0 w-32 h-20 flex items-center justify-center'
                    >
                      <img 
                        src={creator.logo} 
                        alt={creator.name}
                        className='w-24 h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300'
                      />
                    </div>
                  ))}
                  {/* Third set for larger screens */}
                  {creators.map((creator) => (
                    <div
                      key={`third-${creator.id}`}
                      className='shrink-0 w-32 h-20 flex items-center justify-center'
                    >
                      <img 
                        src={creator.logo} 
                        alt={creator.name}
                        className='w-24 h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300'
                      />
                    </div>
                  ))}
                </div>
            </div>
        </div>
    </div>
  )
}

export default TopCreators;