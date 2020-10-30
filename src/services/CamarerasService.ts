interface Camera {
  id: number;
}

interface Fabricante {
  name: string
}

interface ParamsDTO {
  camera: Camera,
  fabricante: Fabricante
}

class CameraService {
  getCamera ({ camera, fabricante }: ParamsDTO) {
    console.log('Get Cameras')
  }
}

export default CameraService
