export const getErrorMessage = (error) => error && error.data && error.data.message;

export const convertBase64 = (file) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });

export const arraysAreIdentical = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i += 1) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};

// Array

export const positionArray = [
  { _id: 'center', name: 'Center' },
  { _id: 'left', name: 'Left' },
  { _id: 'right', name: 'Right' }
];

export const questionTypes = [
  { _id: 'MCQ', name: 'MCQ' },
  // { _id: 'MCQ (Audio)', name: 'MCQ (Audio)' },
  { _id: 'MCQ (Image)', name: 'MCQ (Image)' }
  // { _id: 'Ranking', name: 'Ranking' },
  // { _id: 'Ranking (Audio)', name: 'Ranking (Audio)' },
  // { _id: 'Fill in the blanks', name: 'Fill in the blanks' },
  // { _id: 'Mix and Match', name: 'Mix and Match' },
  // { _id: 'Tapping Rhythm', name: 'Tapping Rhythm' }
];

export const promptTypeArray = ['Text', 'Image', 'Audio'];

export const numberArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const sectionArray = ['Kids', 'Adults'];
