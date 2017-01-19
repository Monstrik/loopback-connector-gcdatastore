require('./init.js');

var ds = getDataSource();

describe('test test framework', function () {
  it('empty test', function (done) {
    done();
  });
});

describe('Create Model', function () {
  var Customer = ds.createModel(
    'customer',
    {name: String, emails: [String], age: Number},
    {forceId: false});
  before(function (done) {

    Customer.all(function (err, result) {
      var keyArr = [];
      result.forEach(function (item) {
        keyArr.push(item.id)
      });
      //console.log(keyArr);
      done();
    });

  });

  it('should create Model', function (done) {
    Customer.create({
      name: 'John1',
      emails: ['john@x.com', 'john@y.com'],
      age: 30,
    }, function (err, customer) {
      //customer.name.should.equal('John1');
      customer.should.have.property('id');
      done();
    });
  });

  it('should create and delete Model', function (done) {
    Customer.create({
      name: 'John1',
      emails: ['john@x.com', 'john@y.com'],
      age: 30,
    }, function (err, customer) {
      customer.should.have.property('id');
      var  tid= customer.id;
      console.log(tid);
      Customer.destroyById(tid*1, function(err,data){
        Customer.findById(tid, function (err, found) {
          if (err) {
            console.error(err);
          }
          else {
            console.error(found);
            done();
          }
        })

      });
    });
  });
});
