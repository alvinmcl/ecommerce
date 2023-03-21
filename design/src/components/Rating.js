function Rating(props) {
  const { rating, numReviews, caption } = props;
  var hasHalfStar = false;
  let targetedStarForHalf = -1;
  const ratingStars = [];
  if (rating !== undefined) {
    let tempRating = new String(rating);
    if (tempRating.includes('.')) {
      hasHalfStar = tempRating.split('.')[1] >= 0.5;
    }
    targetedStarForHalf = parseInt(tempRating.split('.')[0]);

    for (let i = 0; i < 5; i++) {
      ratingStars.push(
        <span>
          <i
            className={
              i < targetedStarForHalf
                ? 'fas fa-star'
                : targetedStarForHalf === i && hasHalfStar
                ? 'fas fa-star-half-alt'
                : 'far fa-star'
            }
          />
        </span>
      );
    }
  }

  return (
    <div className="rating">
      {ratingStars}
      {caption ? (
        <span>{caption}</span>
      ) : (
        <span>{' ' + numReviews + ' reviews'}</span>
      )}
    </div>
  );
}
export default Rating;
