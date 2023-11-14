import http from './http';

interface Slide {
  ID: number;
  Path: string;
  Title: string;
  LinkURL: string;
  Width: number;
  Height: number;
  SortOrder: number;
}

interface SlidePost {
  Title: string;
  LinkURL: string;
  SortOrder: number;
  ImageData: string;
}

const getSlides = (): Promise<Slide[]> => http.get('contentmanagement/banner');

const submitSlide = (slide: SlidePost): Promise<Slide> =>
  http.post('contentmanagement/banner', slide);

const deleteSlide = (ID: number): Promise<Slide> => http.del(`contentmanagement/banner/${ID}`);

const contentManagemetService = {
  getSlides,
  submitSlide,
  deleteSlide,
};

export default contentManagemetService;
