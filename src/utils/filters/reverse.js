/**
 * Workaround: Eleventy's Liquid library reverses arrays in place.
 * Sorting an array means sorting it for all subsequent pages.
 * 
 * This filter overwrites that behavior and copies the array before
 * sorting.
 * 
 * @param {*} collection 
 * @returns 
 */
module.exports = (collection) => {
    const arr = [...collection];
    return arr.reverse();
};