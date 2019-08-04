# Deceptively Delicious

This is a project created by going through Wes Bos's Learn Node course.

In this course we created a site that is built upon Node.js, Express, MongoDB. We built a full stack simple 'yelp-like' restaurant application which users can search, geo-locate, review and curate their favorite restaurants from anywhere.

The application has three main models — Users, Stores and Reviews — all of which are relational. It hits upon many of today's application needs such as user authentication, database storage, Ajax REST API, file upload and image resizing.

## Sample Data

To load sample data, run the following command in your terminal:

```bash
npm run sample
```

If you have previously loaded in this data, you can wipe your database 100% clean with:

```bash
npm run blowitallaway
```

That will populate 16 stores with 3 authors and 41 reviews. The logins for the authors are as follows:

|Name|Email (login)|Password|
|---|---|---|
|Wes Bos|wes@example.com|wes|
|Debbie Downer|debbie@example.com|debbie|
|Beau|beau@example.com|beau|
