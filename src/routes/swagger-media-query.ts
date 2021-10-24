/**
 * @swagger
 * /media/{filename}:
 *   get:
 *     summary: Доступ к файлам
 *     tags: [Media Storage]
 *     description: Доступ к содержимому файлов по имени
 *     parameters:
 *      - in: path
 *        name: filename
 *        schema:
 *          type: string
 *        description: Название файла
 *     responses:
 *      '200':
 *        description: Получение найденного файла
 *      '404':
 *        description: Файл не найден
 */