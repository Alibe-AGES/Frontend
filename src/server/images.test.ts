import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import { appendImage } from './images';

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;

function mockBlobResponse(type: string): Blob {
  const blob = new Blob(['image'], { type });
  global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) });
  return blob;
}

describe('appendImage', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('appends the native file as-is', async () => {
    const formData = new FormData();
    const append = jest.spyOn(formData, 'append');

    await appendImage(formData, 'image', { uri: 'file:///bloom.jpg' }, 'event-image');

    expect(append).toHaveBeenCalledWith('image', expect.any(File));
  });

  describe('on web', () => {
    beforeEach(() => {
      jest.replaceProperty(Platform, 'OS', 'web');
    });

    test('reads the blob URL and keeps a valid file name', async () => {
      const blob = mockBlobResponse('image/png');
      const formData = new FormData();
      const append = jest.spyOn(formData, 'append');

      await appendImage(
        formData,
        'image',
        { uri: 'blob:http://localhost/1', fileName: 'bloom.png' },
        'event-image'
      );

      expect(global.fetch).toHaveBeenCalledWith('blob:http://localhost/1');
      expect(append).toHaveBeenCalledWith('image', blob, 'bloom.png');
    });

    test('names the file from the blob type when the picked name has no image extension', async () => {
      const blob = mockBlobResponse('image/webp');
      const formData = new FormData();
      const append = jest.spyOn(formData, 'append');

      await appendImage(
        formData,
        'image',
        { uri: 'blob:http://localhost/2', fileName: 'photo' },
        'event-image'
      );

      expect(append).toHaveBeenCalledWith('image', blob, 'event-image.webp');
    });

    test('falls back to the picked mime type, then to jpg', async () => {
      const blob = mockBlobResponse('');
      const formData = new FormData();
      const append = jest.spyOn(formData, 'append');

      await appendImage(
        formData,
        'image',
        { uri: 'blob:http://localhost/3', mimeType: 'image/png' },
        'event-image'
      );
      await appendImage(formData, 'image', { uri: 'blob:http://localhost/4' }, 'event-image');

      expect(append).toHaveBeenNthCalledWith(1, 'image', blob, 'event-image.png');
      expect(append).toHaveBeenNthCalledWith(2, 'image', blob, 'event-image.jpg');
    });

    test('throws when the selected image cannot be read', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });

      await expect(
        appendImage(new FormData(), 'image', { uri: 'blob:http://localhost/5' }, 'event-image')
      ).rejects.toThrow('Não foi possível ler a imagem selecionada.');
    });
  });
});
