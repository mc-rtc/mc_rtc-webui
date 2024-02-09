import { Color } from '../types/Color';
import {
  GeometryBox,
  GeometryCylinder,
  GeometryMesh,
  GeometrySphere,
  GeometrySuperellipsoid,
  MaterialColor,
  rbd_Visual
} from '../types/rbd_Visual';

import { Box } from '../gui/Box';
import { Cylinder } from '../gui/Cylinder';
import { Mesh } from '../gui/Mesh';
import { Sphere } from '../gui/Sphere';

import { ControllerClient } from '../ControllerClient';
import { GUI } from '../GUI';

import { pt_to_matrix4 } from '../widgets/utils';

export class Visual {
  private gui: GUI;
  private object: Box | Cylinder | Mesh | Sphere | null = null;

  constructor(client: ControllerClient) {
    this.gui = client.gui;
  }
  update(visual: rbd_Visual, pt: number[]) {
    const color = new Color();
    const material = visual.material.data;
    if (material instanceof MaterialColor) {
      color.data = material.toArray();
    }
    const geometry = visual.geometry.data;
    if (geometry instanceof GeometryBox) {
      if (this.object instanceof Box) {
        this.object.update(geometry.size.x, geometry.size.y, geometry.size.z);
      } else {
        this.update_object_type(this.gui.box(geometry.size.x, geometry.size.y, geometry.size.z, color));
      }
    } else if (geometry instanceof GeometryCylinder) {
      if (this.object instanceof Cylinder) {
        this.object.update(geometry.radius, geometry.length);
      } else {
        this.update_object_type(this.gui.cylinder(geometry.radius, geometry.length, color));
      }
    } else if (geometry instanceof GeometrySphere) {
      if (this.object instanceof Sphere) {
        this.object.update(geometry.radius);
      } else {
        this.update_object_type(this.gui.sphere(geometry.radius, color));
      }
    } else if (geometry instanceof GeometryMesh) {
      if (this.object instanceof Mesh) {
        this.object.update(geometry.filename, geometry.scaleV);
      } else {
        this.update_object_type(this.gui.mesh(geometry.filename, geometry.scaleV));
      }
    } else if (geometry instanceof GeometrySuperellipsoid) {
      console.error(`Superellipsoids are not handled by this interface`);
      this.update_object_type(null);
    } else {
      this.update_object_type(null);
    }
    if (this.object) {
      const m4 = pt_to_matrix4(pt).multiply(pt_to_matrix4(visual.origin));
      this.object.quaternion.setFromRotationMatrix(m4);
      this.object.position.setFromMatrixPosition(m4);
      this.object.setColor(color);
    }
  }

  private update_object_type(object: Box | Cylinder | Mesh | Sphere | null) {
    if (this.object) {
      this.object.cleanup();
    }
    this.object = object;
  }

  cleanup() {
    if (this.object) {
      this.object.cleanup();
    }
  }
}
