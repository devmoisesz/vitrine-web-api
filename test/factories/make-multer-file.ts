export const makeFakeMulterFile = (filename = 'camisa.jpg'): Express.Multer.File => {
    return {
      fieldname: 'file',
      originalname: filename,
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake-image-content'), 
      size: 1024,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };
  };