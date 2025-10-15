import { IoMdArrowUp } from "react-icons/io";

const Hero = () => {
  return (
    <section className="h-fit w-dvw flex flex-col lg:flex-row lg:items-start lg:justify-center gap-10 pt-40 items-center">
      {/* Video Shape Container */}
      <div
        id="hero-video-container"
        className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[700px] xl:h-[700px] bg-blue-500"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://video.gumlet.io/67aac507feefe705cbe0b2ff/688beab8f327d6ddd057fefb/download.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Hero Content */}
      <div className="flex flex-col gap-10">
        {/* Hero Heading */}
        <div className="relative text-3xl md:text-4xl lg:text-5xl xl:text-[4rem] font-cabinet-bold flex flex-col lg:gap-0 xl:gap-0 xl:pt-0 lg:-top-7 lg:pt-0 lg:mb-0 text-center lg:text-left">
          <div className="relative lg:-left-[45%] flex gap-5 items-center xl:mb-5 justify-center lg:justify-start">
            <span>Meet</span> <img src="/logo.png" alt="Logo" className="h-32"></img> <span className="font-black" style={{background: 'linear-gradient(48deg,rgba(254, 180, 246, 1) 0%, rgba(173, 249, 238, 1) 50%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>CSE</span>
          </div>
          <div className="relative lg:-left-[30%] lg:mb-10 xl:mb-14">
            World's First Ever Creator
          </div>
          <div className="relative lg:-left-[15%]">
            Stock Exchange Platform
          </div>
        </div>

        {/* Hero Description */}
        <div className="mb-10 lg:mb-0 xl:mb-10 font-cabinet-medium text-center lg:text-left text-sm lg:text-base xl:text-lg text-zinc-700">
          <p>Fans, own a piece of your idols&apos; success with creator tokens.</p>
          <p>Creators, fund your dreams and build a loyal community.</p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* Primary CTA - Start Investing */}
          <div className="flex">
            <button className="bg-brand-green px-8 h-12 text-sm xl:text-base flex items-center rounded-full font-quicksand font-semibold">
              Start Investing Now
            </button>
            <div className="bg-brand-green w-12 h-12 rounded-full flex justify-center items-center transform rotate-45">
              <IoMdArrowUp className="h-5 w-5" />
            </div>
          </div>

          {/* Secondary CTA - Launch Token */}
          <div className="flex">
            <button className="border-2 text-sm xl:text-base border-black px-8 h-12 flex items-center rounded-full font-quicksand font-semibold">
              Launch Your Token
            </button>
            <div className="border-2 border-black w-12 h-12 rounded-full flex justify-center items-center transform rotate-45">
              <IoMdArrowUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
