import { User } from 'firebase/auth';
import { addDoc, collection, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PaymentTransaction, ProSubscription } from '../types';

const INDIVIDUAL_PRICE_MVR = 150;
const DIVE_CENTRE_PRICE_MVR = 750;

export function useProAccess(user: User | null) {
  const [subscription, setSubscription] = useState<ProSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const paymentUrl = String(import.meta.env.VITE_BML_PAYMENT_REQUEST_URL || '').trim();

  useEffect(() => {
    if (!user || !db) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    return onSnapshot(
      doc(db, 'proSubscriptions', user.uid),
      (snapshot) => {
        setSubscription(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as ProSubscription) : null);
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        try {
          handleFirestoreError(snapshotError, OperationType.GET, `proSubscriptions/${user.uid}`);
        } catch (wrappedError) {
          setError(wrappedError instanceof Error ? wrappedError.message : 'Unable to load Pro access.');
        }
        setLoading(false);
      }
    );
  }, [user]);

  const access = useMemo(() => {
    const isActive = subscription?.status === 'active';
    return {
      loading,
      subscription,
      tier: isActive ? subscription.tier : 'free',
      hasIndividualPro: isActive && subscription.tier === 'individual-diver-pro',
      hasDiveCentrePro: isActive && subscription.tier === 'dive-centre-pro',
      hasAnyPro: isActive && subscription.tier !== 'free',
      error,
    };
  }, [error, loading, subscription]);

  const createPaymentRequest = async (tier: PaymentTransaction['tier']) => {
    if (!user || !db) {
      setError('Sign in before upgrading to Pro.');
      return;
    }

    const checkoutWindow = paymentUrl ? window.open('about:blank', '_blank', 'noopener,noreferrer') : null;
    setIsCreatingPayment(true);
    setError(null);
    setPaymentMessage(null);

    try {
      const now = new Date().toISOString();
      const externalReference = `bml-${user.uid.slice(0, 10)}-${Date.now()}`;
      await addDoc(collection(db, 'paymentTransactions'), {
        userId: user.uid,
        provider: 'bank-of-maldives',
        tier,
        status: 'pending',
        amountMvr: tier === 'individual-diver-pro' ? INDIVIDUAL_PRICE_MVR : DIVE_CENTRE_PRICE_MVR,
        currency: 'MVR',
        paymentMode: paymentUrl ? 'payment-request' : 'payment-gateway',
        externalReference,
        ...(paymentUrl ? { externalPaymentUrl: paymentUrl } : {}),
        createdAt: now,
        updatedAt: now,
      });

      if (paymentUrl) {
        if (checkoutWindow) {
          checkoutWindow.location.href = paymentUrl;
        } else {
          window.location.assign(paymentUrl);
        }
        setPaymentMessage(`BML payment request ${externalReference} created. Complete the checkout to activate Pro after verification.`);
      } else {
        setPaymentMessage(
          `BML payment request ${externalReference} created. BML checkout URL is not configured yet, so an authorised admin must verify this payment before Pro access is activated.`
        );
      }
    } catch (paymentError) {
      checkoutWindow?.close();
      try {
        handleFirestoreError(paymentError, OperationType.CREATE, 'paymentTransactions');
      } catch (wrappedError) {
        setError(wrappedError instanceof Error ? wrappedError.message : 'Unable to create payment request.');
      }
    } finally {
      setIsCreatingPayment(false);
    }
  };

  return {
    ...access,
    isCreatingPayment,
    paymentMessage,
    paymentUrlConfigured: Boolean(paymentUrl),
    createPaymentRequest,
  };
}
