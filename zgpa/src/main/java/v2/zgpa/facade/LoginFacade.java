/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package v2.zgpa.facade;

import java.util.List;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import v2.zgpa.model.Qutuostaffentity;
import v2.zgpa.model.Yingxiaostaffentity;

/**
 *
 * @author lqshanshuo
 */
@Stateless
public class LoginFacade extends AbstractFacade<Object> {

    @PersistenceContext(unitName = "queryPU_bj")
    private EntityManager em;

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

    public LoginFacade() {
        super(Object.class);
    }

    public void create(Object object) {
        em.persist(object);
    }

    public Qutuostaffentity loginQutuo(String type, String personCode) {
        Qutuostaffentity qutuostaffentity = null;
        List<Qutuostaffentity> list = em.createQuery("SELECT q FROM Qutuostaffentity q WHERE q.type = :a AND q.personal_code = :b")
                .setParameter("a", type)
                .setParameter("b", personCode)
                .getResultList();
        if(list!=null&&list.size()==1){
            qutuostaffentity = list.get(0);
        }
        return qutuostaffentity;
    }
    
    public Yingxiaostaffentity loginYingxiao(String type, String personCode) {
        Yingxiaostaffentity yingxiaostaffentity = null;
        List<Yingxiaostaffentity> list = em.createQuery("SELECT y FROM Yingxiaostaffentity y WHERE y.type = :a AND y.personal_code = :b")
                .setParameter("a", type)
                .setParameter("b", personCode)
                .getResultList();
        if(list!=null&&list.size()==1){
            yingxiaostaffentity = list.get(0);
        }
        return yingxiaostaffentity;
    }

}
