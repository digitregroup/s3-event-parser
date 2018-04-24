const util = require('util');
const S3Notification = require('./s3-notification');

const S3EventParser = class {

  constructor(event, customLogger) {
    this.logger = customLogger || console;
    this.event = event;
  }

  /**
   * Parse an event and returns details
   * @param {Object} event Event sent by S3
   * @param {{log: function, info: function, error: function}} [customLogger] Custom logger
   * @returns {S3Notification} Parsed S3 event
   */
  parse() {
    this.logger.log('Parsing event:\n', util.inspect(this.event, {depth: 5}));

    // Get the S3 notification object from AWS S3 or SNS event
    const raws3NotifObject = this.getRawS3NotificationFromEvent();

    // Get a parsed and cleaned S3 Notification object
    const parsedS3Notification = new S3Notification(raws3NotifObject);

    this.logger.log('Parsed S3 Event:\n', parsedS3Notification);

    return parsedS3Notification;
  }

  /**
   * Extract the S3 notification object from the AWS S3 or SNS Event
   * @param {Object} event AWS S3/SNS Event
   * @return {Object|null|false} Return the raw s3 Notification object if found,
   *                             otherwise return null/false is the event payload is not supported
   */
  getRawS3NotificationFromEvent(event = this.event) {
    const eventToParse = event;

    if (!eventToParse || !eventToParse.Records || !eventToParse.Records[0]) {
      throw new Error('Invalid AWS Event payload (should have "Records" child key).');
    }

    let s3Notification = null;
    switch (eventToParse.Records[0].eventSource || eventToParse.Records[0].EventSource) {
      case 'aws:s3':
        this.logger.log('Parsing from aws:s3 event.');
        s3Notification = eventToParse.Records[0].s3;
        break;
      case 'aws:sns':
        this.logger.log('Parsing from aws:sns event.');
        s3Notification = this.getRawS3NotificationFromEvent(
          JSON.parse(eventToParse.Records[0].Sns.Message)
        );
        break;
      default: {
        const eventSource = eventToParse.Records[0].eventSource || eventToParse.Records[0].EventSource;
        throw new Error('Unsupported AWS Event Source: ' + eventSource);
      }
    }

    return s3Notification;
  }
};

module.exports = S3EventParser;
