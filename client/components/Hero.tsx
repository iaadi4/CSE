import { IoMdArrowUp } from "react-icons/io";

const Hero = () => {
  return (
    <section className="min-h-dvh w-dvw flex flex-col lg:flex-row lg:items-start lg:justify-center gap-10 pt-40 items-center">
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
          className="absolute inset-0 w-full h-full object-fill"
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
        <div className="text-3xl md:text-4xl lg:text-5xl xl:text-[4rem] font-cabinet-bold flex flex-col lg:gap-8 xl:gap-14 lg:pt-5 lg:mb-8 text-center lg:text-left">
          <div className="relative lg:-left-[45%]">
            Meet CSE,
          </div>
          <div className="relative lg:-left-[30%]">
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
