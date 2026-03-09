import chalk from "chalk"

const handleAggregatePagination = async (collectionName, aggregation, query, filters) => {
    try {
        const { page = 1, limit = 10 } = query;
        const options = { page: parseInt(page), limit: parseInt(limit) }

        const updatedAggregation = handleFilteration(filters, aggregation.filter(Boolean))
        const data = await collectionName.aggregatePaginate(updatedAggregation, options)

        return {
            totalDocs: data.totalDocs,
            totalPages: data.totalPages,
            page: data.page,
            limit: data.limit,
            prevpage: data.hasPrevPage,
            nextpage: data.hasNextPage,
            pageCounter: data.pagingCounter,
            collectionData: data.docs,
        }
    } catch (error) {
        console.log(chalk.red('handelAggregatePagination :' + error.message))
    }
}

/**
 * Apply filter definitions to a MongoDB aggregation pipeline.
 * @param {Array} filters - Array of filter objects from the client
 * @param {Array} pipeline - Existing aggregation pipeline stages
 * @returns {Array} Updated aggregation pipeline
*/

function handleFilteration(filters, pipeline) {
    if (!filters?.length || filters?.length === 0) return pipeline;

    filters?.forEach((item) => {
        switch (item.type) {
            case 'search':
                pipeline.push({
                    $match: { [item.field]: { $regex: item.value, $options: 'i' } }
                })
                break;

            case 'number':
                pipeline.push({
                    $match: { [item.field]: { $gte: parseInt(item.value || 0) } }
                })
                break;

            case 'boolean':
                pipeline.push({
                    $match: { [item.field]: item.value === 'true' }
                })
                break;

            case 'groupValueFilter':
                pipeline.push({
                    $match: { [item.field]: item.value }
                })
                break;

            case 'date':
                pipeline.push(
                    { $addFields: { filter_date: { $dateToString: { format: "%Y-%m-%d", date: `$${item.field}` } } } },
                    { $match: { filter_date: { $regex: item.value, $options: 'i' } } }
                )
                break;

            case 'minmax':
                pipeline.push({
                    $match: {
                        [item.field]: {
                            $gte: parseInt(item.value?.start || 0),
                            $lte: parseInt(item.value?.end || 0)
                        }
                    }
                })
                break;
        }
    })

    return pipeline
}


export default handleAggregatePagination 