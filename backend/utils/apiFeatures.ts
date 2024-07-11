export default async (model: any, queryString: any) => {
    // Build query
    // 1a) filtering
    const queryObj = { ...queryString };
    const excludeFields = ['pageIndex', 'sort', 'pageSize', 'fields', 'total', 'query'];
    excludeFields.forEach(el => delete queryObj[el]);

    // 1b) Advanced filtering
    let query = model.find(queryObj);
   

    // 2) sorting
    // if (queryString.sort) {
    //     console.log(queryString);
    //     const sort = queryString.sort.order.split(',').join(' ');
    //     query = query.sort(sort);
    // } else {
    //     query = query.sort('-createdAt');
    // }

    // 3) field limiting
    if (queryString.fields) {
        const fields = queryString.fields.split(',').join(' ');
        query = query.select(fields);
    } else {
        query = query.select('-__v');
    }

    // 4) pagination
    const page = parseInt(queryString.pageIndex) || 1;
    const limit: any = queryString.pageSize ? parseInt(queryString.pageSize) : 'all';
    const skip = (page - 1) * limit;

    query = limit === 'all' ? query: query.skip(skip).limit(limit);
    if (queryString.pageIndex) {
        const numDocs = await model.find().count();
        if (skip > numDocs) throw new Error('page_not_exist');
    }

    return query;
}
    