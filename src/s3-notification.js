const path = require('path');
const Joi  = require('joi');

const handleJoiError = require('./handle-joi-error')('S3Notification');

const S3Notification = class {
  constructor(rawS3Notification) {
    this.rawS3Notification = rawS3Notification;
    this.validateS3NotificationObject();
    this.parseS3NotificationObject();
  }

  /**
   * Validates the raw S3 notification object coming from the event
   * @returns {void}
   */
  validateS3NotificationObject() {
    const schema = Joi.object().keys({
      object: Joi.object().keys({
        key: Joi.string().required(),
        size: Joi.number().required()
      })
        .required(),
      bucket: Joi.object().keys({
        name: Joi.string().required()
      })
        .required()
    })
      .required();

    const result = Joi.validate(this.rawS3Notification, schema, {allowUnknown: true});
    if (result.error) {
      handleJoiError(result.error);
    }

    this.validatedS3NotificationObject = result.value;
  }

  parseS3NotificationObject() {
    // Cleaned file path (S3 key)
    this.filePath = decodeURIComponent(this.rawS3Notification.object.key.replace(/\+/g, ' '));
    // Raw S3 Key
    this.key = this.rawS3Notification.object.key;
    // File prefix
    this.filePrefix = path.dirname(this.filePath);
    // Bucket name
    this.bucketName = this.rawS3Notification.bucket.name;
    // File size
    this.fileSize = this.rawS3Notification.object.size;
  }
};

module.exports = S3Notification;
