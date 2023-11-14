import GordonLoader from 'components/Loader';
import { useEffect, useRef, useState } from 'react';
import ReactImageGallery from 'react-image-gallery';
import ImageGallery from 'react-image-gallery';
import contentManagementService, { Slide } from 'services/contentManagement';
import { compareByProperty } from 'services/utils';

const Carousel = () => {
  const [loading, setLoading] = useState(true);
  const [carouselContent, setCarouselContent] = useState<Slide[]>([]);
  const imageGalleryRef = useRef<ReactImageGallery>(null);

  useEffect(() => {
    const loadSlides = async () => {
      const slides = await contentManagementService.getSlides();
      slides.sort(compareByProperty('SortOrder'));

      setCarouselContent(slides);
      setLoading(false);
    };

    loadSlides();
  }, []);

  const handleClickSlide = () => {
    const currentSlideIndex = imageGalleryRef.current?.getCurrentIndex();
    if (!currentSlideIndex) return;

    const currentSlideLink = carouselContent[currentSlideIndex].LinkURL;
    if (currentSlideLink !== '') {
      window.location.href = currentSlideLink;
    }
  };

  if (loading) {
    return <GordonLoader />;
  }

  return (
    <ImageGallery
      ref={imageGalleryRef}
      showThumbnails={false}
      showFullscreenButton={false}
      showPlayButton={false}
      showBullets={true}
      autoPlay={true}
      showNav={false}
      slideInterval={5000}
      items={carouselContent.map((slide) => ({
        original: slide.Path,
        originalAlt: slide.Title,
        originalTitle: slide.Title,
      }))}
      onClick={handleClickSlide}
      lazyLoad={true}
    />
  );
};

export default Carousel;
