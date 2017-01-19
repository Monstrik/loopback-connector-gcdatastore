
require('./init.js');

var ds = getDataSource();

describe('test test framework', function() {
  it('empty test', function(done) {
    done();
  });
});

describe('Create Model', function () {
  var Customer = ds.createModel(
    'customer',
    {name: String, emails: [String], age: Number},
    {forceId: false});
  before(function (done) {
    //done();
    Customer.deleteAll(done);
    //Customer.create({name: 'TestName', emails: ['TestEmail'], age: 32},{},done)
  });

  it('should create Model', function (done) {
    Customer.create({
      name: 'John1',
      emails: ['john@x.com', 'john@y.com'],
      age: 30,
    }, function(err, customer) {
      customer.name.should.equal('John1');
      done();
      // Customer.create({
      //   name: 'John2',
      //   emails: ['john2@x.com', 'john2@y.com'],
      //   age: 40,
      // }, function(err, customer) {
      //   customer.name.should.equal('John2');
      //   done(err, customer);
      // });
    });

  });
//
//   // it('should Save Model', function (done) {
//   //   Customer.save({
//   //     name: 'John1',
//   //     emails: ['john@x.com', 'john@y.com'],
//   //     age: 30,
//   //   }, function(err, customer) {
//   //     customer.save(done);
//   //   });
//   //
//   // });
//
//
//   //
//   // it('should allow custom name for the id property for findById', function(done) {
//   //   Customer.findById(1, function(err, customer) {
//   //     customer.seq.should.equal(1);
//   //     done(err, customer);
//   //   });
//   // });
//   //
//   // it('should allow inq with find', function(done) {
//   //   Customer.find({ where: { seq: { inq: [1] }}}, function(err, customers) {
//   //     customers.length.should.equal(1);
//   //     customers[0].seq.should.equal(1);
//   //     done(err);
//   //   });
//   // });
 });
