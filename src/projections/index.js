import {
  Sphere360, Sphere360_LR, Sphere360_TB,
  Sphere180, Sphere180_LR, Sphere180_TB,
  SphereFisheye190, SphereFisheye200
} from './spherical.js';
import { EAC, EAC_LR } from './eac.js';
import Cube360 from './cube.js';

export default {
  '360':      Sphere360,
  '360_LR':   Sphere360_LR,
  '360_TB':   Sphere360_TB,
  '180':      Sphere180_LR, // We treat '180' as '180_LR'
  '180_MONO': Sphere180,
  '180_LR':   Sphere180_LR,
  '180_TB':   Sphere180_TB,
  'FISHEYE_190':  SphereFisheye190,
  'FISHEYE_200':  SphereFisheye200,
  '360_CUBE': Cube360,
  'EAC':      EAC,
  'EAC_LR':   EAC_LR
};
