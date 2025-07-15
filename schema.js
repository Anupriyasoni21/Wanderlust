const Joi=require("joi");

module.exports. listingSchema=Joi.object({
    Listing :Joi.object({
        title:Joi.string().required(),
        price:Joi.number().required().min(0),
        description:Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        image:Joi.string().allow("",null),
    }).required()
});




module.exports.reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required()
});