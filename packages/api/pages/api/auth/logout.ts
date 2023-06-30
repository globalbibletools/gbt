import createRoute from '../../../shared/Route';

export default createRoute()
  .post<void, void>({
    async handler(req, res) {
      await res.logout();

      res.ok();
    },
  })
  .build();
