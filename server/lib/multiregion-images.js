module.exports = function multiregionImages (imageUrl) {
	const UUID = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/.exec(imageUrl);
	if (UUID && imageUrl.match(/com.ft.imagepublish/)) { // only images from the s3 bucket will be transformed
		return `http://prod-upp-image-read.ft.com/${UUID}`; // UUID is an array and the template string performs the equvalent ofjoin(',')
	}
	return imageUrl;
};
