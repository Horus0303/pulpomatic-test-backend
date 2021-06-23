const reduceCurrencyOrg = (arr) => {
    const arrReduced = arr.reduce((prev, next) => {
        if (next.organization in prev) {
            prev[next.organization].currency += next.currency;
        } else {
            prev[next.organization] = next.currency;
        }
        return prev;
    }, {})

    const sortable = Object.fromEntries(
        Object.entries(arrReduced).sort(([,a],[,b]) => a-b).reverse()
    );
    
    return sortable
}


module.exports = {
    reduceCurrencyOrg
}