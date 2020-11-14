import {Request, Response} from 'express';
import DBController from './DBController';
import moment from 'moment';
import CamsController from './CamsController';
import LogController from './LogController';

// -- entity
import {Locations} from '../entity/gifplay/Locations';
import {SpaceCameras} from '../entity/gifplay/SpaceCameras';
import {Record} from '../entity/gifplay/Record';

interface IReceiveConcatCams extends Locations {
  spaceCameras: SpaceCameras[];
}

class CronController {
  public async index(req: Request, res: Response): Promise<Response> {
    await this.startRecordLocationsMovie();
    await this.stopRecordLocationsMovie();

    return res.json({response: moment().format('DD-MM-YYYY')});
  }

  private async stopRecordLocationsMovie(): Promise<void> {
    // -- para as gravções se chegou o fim da locacao;
    const dateNow = moment().format('Y-M-DD H:mm');

    const params = {
      table: 'record',
      entity: Record,
      where: `date_end < "${dateNow}"`,
    };
    const record = await DBController.get(params);
    record.map((item: Record) => {
      console.log('=== record ===', item);
      if (item.pid) {
        CamsController.stopRecordMovie(item.pid);
      }
      return item;
    });
  }

  private async startRecordLocationsMovie(): Promise<void> {
    // -- busca as locacoes e aciona a funcao para gravar os videos.
    const dateNow = moment().format('Y-M-DD H:mm');
    const getParams = {
      table: 'locations',
      entity: Locations,
      where: `time_start <= "${dateNow}"
              AND time_end > "${dateNow}"
              AND ip <> ''
              AND port <> ''
              AND channel_default <> ''
              AND NOT EXISTS (SELECT 1
                FROM record
                WHERE  record.cam_id = space_cameras.id)`,
      leftJoin: {
        nameNewField: 'locations.spaceCameras',
        table2Entity: SpaceCameras,
        table2Name: 'space_cameras',
        condition: 'locations.spaceId = space_cameras.space_id',
      },
    };
    const locations = await DBController.get(getParams);
    const itensRecord: Record[] = [];
    Promise.all(
      locations.map(async (location: IReceiveConcatCams) => {
        // -- dispara a funcao para gravar video de cada camera
        const {spaceCameras} = location;

        await spaceCameras.map((cam: SpaceCameras) => {
          if (
            location.id &&
            cam.id &&
            cam.cameraAlias &&
            cam.ip &&
            cam.port &&
            cam.channelDefault
          ) {
            const pidCam = CamsController.getMovieCam({
              LocationID: location.id,
              ID: cam.id,
              name: cam.cameraAlias,
              IP: cam.ip,
              port: cam.port,
              channel: cam.channelDefault,
              tcp: cam.tcp,
              user: cam.userCam || '',
              password: cam.passwordCam || '',
            });

            // --  log de inicio de gravação
            pidCam.then((pid) => {
              const params = {
                camId: cam.id,
                locationId: location.id,
                log: `iniciando gravação da camera, pid: ${pid}`,
                success: true,
              };
              LogController.setCamLog(params);

              // -- acrescenta um novo registro na tabela record
              const itemRecord: Record = {
                locationId: location.id,
                camId: cam.id,
                dateStart: location.timeStart,
                dateEnd: location.timeEnd,
                pid: pid,
              };
              itensRecord.push(itemRecord);
            });
          } else {
            const params = {
              camId: cam.id,
              locationId: location.id,
              log:
                'A camera não está cadastrada de forma correta, falta informações para buscar o video',
            };
            LogController.setCamLog(params);
          }
        });

        return location;
      }),
    ).then(() => {
      // -- incrementa os itens na tabela de record.
      const getParams = {
        entity: Record,
        data: itensRecord,
      };
      DBController.set(getParams);
    });
  }
}

export default new CronController();
