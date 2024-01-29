//creating a class for APIFeatures
class APIFeatures {
  constructor(query, querystring) {
    this.query = query;
    this.querystring = querystring;
  }

  filter() {
    let queryObj = { ...this.querystring }; // store obj in variable destructing way
    let excludedField = ['page', 'sort', 'limit', 'fields'];
    excludedField.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.querystring.sort) {
      const DataSort = this.querystring.sort.split(',').join(' ');
      this.query = this.query.sort(DataSort);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitField() {
    if (this.querystring.fields) {
      const fields = this.querystring.fields.split(',').join(' ');
      console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.querystring.page * 1 || 1; //or can be used to define default
    const limit = this.querystring.limit * 1 || 100; //multiply by 1 is used to convert a string into a number
    const skip = (page - 1) * limit;

    //Page=2&limit=10 pg 1 1-10 ,pg2 11-20

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
