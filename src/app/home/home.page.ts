import { Component, OnInit } from '@angular/core';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@ionic-native/camera-preview/ngx';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private cameraPreview: CameraPreview, private base64ToGallery: Base64ToGallery,
    private androidPermissions: AndroidPermissions, private deviceMotion: DeviceMotion) {
    let watch_for_orientation = this.deviceMotion.watchAcceleration().subscribe((acceleration: DeviceMotionAccelerationData) => {
      this.device_orientation = acceleration
      // alert(JSON.stringify(this.device_orientation))
      if (Math.abs(this.device_orientation.x) > Math.abs(this.device_orientation.y)) {
        //Device is in landscape mode
        this.device_width = window.screen.height
        this.device_height = window.screen.width
        this.startCamera()
      } else {
        //Device is in Portrait mode
        this.device_width = window.screen.width
        this.device_height = window.screen.height
        this.startCamera()
      }
    })
  }

  picture: string;
  showGifOne: boolean;
  showGifTwo: boolean;
  device_orientation
  device_width: number
  device_height: number
  options: CameraPreviewOptions = {
    x: 0,
    y: 0,
    width: this.device_width,
    height: this.device_height,
    camera: this.cameraPreview.CAMERA_DIRECTION.FRONT,
    toBack: true,
    tapPhoto: true,
    previewDrag: false
  };

  cameraPictureOpts: CameraPreviewPictureOptions = {
    width: window.innerWidth,
    height: window.innerHeight,
    quality: 100
  }

  ngOnInit() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
      result => console.log("Permissions granted", result.hasPermissions),
      error => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
    );
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
    this.startCamera();
    this.toggleGifAll()
  }

  toggleGifAll() {
    this.showGifOne = true
    this.showGifTwo = true
    setTimeout(() => {
      this.toggleGifOne()
    }, 5000);
  }

  toggleGifOne() {
    this.showGifOne = true
    this.showGifTwo = false
    setTimeout(() => {
      this.toggleGifTwo()
    }, 5000);
  }
  toggleGifTwo() {
    this.showGifOne = false
    this.showGifTwo = true
    setTimeout(() => {
      this.toggleGifAll()
    }, 5000);
  }

  startCamera() {
    this.picture = null
    this.cameraPreview.startCamera(this.options)
      .then(response => {
        // alert('camera running! ' + response)
      })
      .catch(error => {
        console.log('couldnt access camera! ' + error)
      })
  }

  switchCamera() {
    this.cameraPreview.switchCamera()
  }

  takePicture() {
    let selectedImage
    this.cameraPreview.takePicture(this.cameraPictureOpts).then((imageData) => {
      this.picture = `data:image/jpeg;base64,${imageData}`;
      let todecode = atob(imageData);
      // selectedImage = 'data:image/jpeg;base64,' + imageData;
      this.base64ToGallery.base64ToGallery(btoa(todecode), { prefix: '_img', mediaScanner: true }).then(
        res => console.log('Saved image to gallery ', res),
        err => console.log('Error saving image to gallery ', err)
      );
    }, (err) => {
      console.log(err);
    });
    // let picture = `data:image/jpeg;FILE_URI,${result}`;
  }

  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
}
