/* eslint-disable max-len */
const {expect} = require('chai');

const S3EventParser = require('../src/s3-event-parser');
const silentLogger = require('./helpers/silentLogger');


const validS3EventPayloads = [
  {
    'name': 'payload is strictly correct',
    'payload': {
      'bucket': {
        'name': 'capifrance-recrutement-leads-stage'
      },
      'object': {
        'key': 'callback-requests/39852388.json',
        'size': 164
      }
    }
  },
  {
    'name': 'payload is correct with additionnal non-parsed data',
    'payload': {
      'bucket': {
        'name': 'capifrance-recrutement-leads-stage',
        'foo': 'bar'
      },
      'object': {
        'key': 'callback-requests/39852388.json',
        'size': 164,
        'etag': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      },
      'baz': 'sample'
    }
  },


];

const wrongS3EventPayloads = [
  {
    'name': 'payload is empty',
    'payload': {}
  },
  {
    'name': 'payload is null',
    'payload': null
  },
  {
    'name': 'bucket name is missing',
    'payload': {
      'bucket': {},
      'object': {
        'key': 'callback-requests/39852388.json',
        'size': 164
      }
    }
  },
  {
    'name': 'object key is missing',
    'payload': {
      'bucket': {
        'name': 'capifrance-recrutement-leads-stage'
      },
      'object': {
        'size': 164
      }
    }
  },
  {
    'name': 'object size is missing',
    'payload': {
      'bucket': {
        'name': 'capifrance-recrutement-leads-stage'
      },
      'object': {
        'key': 'callback-requests/39852388.json'
      }
    }
  },
  {
    'name': '"object" is empty',
    'payload': {
      'bucket': {
        'name': 'capifrance-recrutement-leads-stage'
      },
      'object': {}
    }
  },
  {
    'name': '"object" is missing',
    'payload': {
      'bucket': {
        'name': 'capifrance-recrutement-leads-stage'
      }
    }
  },
  {
    'name': '"bucket" is missing',
    'payload': {
      'object': {
        'key': 'callback-requests/39852388.json',
        'size': 164
      }
    }
  }
];

describe('S3EventParser global tests', () => {
  it('should fail to parse a null event', () => {
    expect(() => new S3EventParser(null).parse()).to.throw();
  });
  it('should fail to parse an empty event', () => {
    expect(() => new S3EventParser({}).parse()).to.throw();
  });
});

describe('S3EventParser S3 event', () => {
  wrongS3EventPayloads.forEach((item) => {
    it('should fail to parse when: ' + item.name, () => {
      expect(() => new S3EventParser({
        Records: [{
          eventSource: 'aws:s3',
          s3: item.payload
        }]
      }, silentLogger).parse())
        .to.throw();
    });
  });

  it('should fail to parse when: eventSource is not supported', () => {
    expect(() => new S3EventParser({
      Records: [{
        eventSource: 'azure:magikbit'
      }]
    }, silentLogger).parse())
      .to.throw();
  });

  it('should fail to parse when: EventSource (SNS event like) is not supported', () => {
    expect(() => new S3EventParser({
      Records: [{
        EventSource: 'azure:magikbit'
      }]
    }, silentLogger).parse())
      .to.throw();
  });

  validS3EventPayloads.forEach((item) => {
    it('should success to parse when: ' + item.name, () => {
      let parser = null;
      expect(() => {
        parser = new S3EventParser({
          Records: [{
            eventSource: 'aws:s3',
            s3: item.payload
          }]
        }, silentLogger).parse();

        return parser;
      }).not.to.throw();

      expect(parser).to.have.deep.include({
        rawS3Notification: item.payload
      });

      expect(parser).to.have.have.property('filePath');
      expect(parser).to.have.have.property('key');
      expect(parser).to.have.have.property('filePrefix');
      expect(parser).to.have.have.property('bucketName');
      expect(parser).to.have.have.property('fileSize');
    });
  });
});

describe('S3EventParser S3 event via a SNS Event', () => {
  wrongS3EventPayloads.forEach((item) => {
    it('should fail to parse when: ' + item.name, () => {
      expect(() => new S3EventParser({
        Records: [{
          EventSource: 'aws:sns',
          Sns: {
            Message: JSON.stringify({
              Records: [{
                eventSource: 'aws:s3',
                s3: item.payload
              }]
            })
          }
        }]
      }, silentLogger).parse())
        .to.throw();
    });
  });

  validS3EventPayloads.forEach((item) => {
    it('should success to parse when: ' + item.name, () => {
      let parser = null;
      expect(() => {
        parser = new S3EventParser({
          Records: [{
            EventSource: 'aws:sns',
            Sns: {
              Message: JSON.stringify({
                Records: [{
                  eventSource: 'aws:s3',
                  s3: item.payload
                }]
              })
            }
          }]
        }, silentLogger).parse();

        return parser;
      }).not.to.throw();

      expect(parser).to.have.deep.include({
        rawS3Notification: item.payload
      });

      expect(parser).to.have.have.property('filePath');
      expect(parser).to.have.have.property('key');
      expect(parser).to.have.have.property('filePrefix');
      expect(parser).to.have.have.property('bucketName');
      expect(parser).to.have.have.property('fileSize');
    });
  });
});
